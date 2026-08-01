import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './NyanGameModal.module.css';

const WIDTH = 800;
const HEIGHT = 450;
const BEST_SCORE_KEY = 'nyan-space-demo-best-score';

type Entity = {
  x: number;
  y: number;
  size: number;
  speed: number;
};

type FoodDefinition = {
  name: string;
  icon: string;
  points: number;
  extraLife?: boolean;
};

type FoodEntity = Entity & { food: FoodDefinition };

const FOODS: FoodDefinition[] = [
  { name: 'Печиво', icon: 'cookie', points: 10 },
  { name: 'Полуниця', icon: 'strawberry-1', points: 15 },
  { name: 'Цукерка', icon: 'candy', points: 20 },
  { name: 'Морозиво', icon: 'soft-ice-cream-1', points: 25 },
  { name: 'Піца', icon: 'pizza-1', points: 30 },
  { name: 'Бургер', icon: 'hamburger-1', points: 35 },
  { name: 'Торт', icon: 'shortcake-1', points: 50 },
];

const LIFE_FISH: FoodDefinition = {
  name: 'Рибка життя',
  icon: 'tropical-fish',
  points: 0,
  extraLife: true,
};

export function applyCollectibleReward(
  lives: number,
  score: number,
  collectible: Pick<FoodDefinition, 'points' | 'extraLife'>
) {
  return collectible.extraLife
    ? { lives: Math.min(3, lives + 1), score }
    : { lives, score: score + collectible.points };
}

type GameState = {
  catY: number;
  velocity: number;
  score: number;
  hudTimer: number;
  lives: number;
  elapsed: number;
  obstacleTimer: number;
  treatTimer: number;
  invulnerableUntil: number;
  rainbowImpulse: number;
  obstacles: Entity[];
  treats: FoodEntity[];
  stars: Entity[];
};

interface Props {
  onClose: () => void;
}

function createGame(): GameState {
  return {
    catY: HEIGHT / 2,
    velocity: 0,
    score: 0,
    hudTimer: 0,
    lives: 3,
    elapsed: 0,
    obstacleTimer: 0,
    treatTimer: 0,
    invulnerableUntil: 0,
    rainbowImpulse: 0,
    obstacles: [],
    treats: [],
    stars: Array.from({ length: 55 }, (_, index) => ({
      x: (index * 149) % WIDTH,
      y: (index * 83) % HEIGHT,
      size: 1 + (index % 3),
      speed: 18 + (index % 4) * 9,
    })),
  };
}

function overlaps(catY: number, entity: Entity): boolean {
  const cat = { x: 142, y: catY - 34, width: 105, height: 68 };
  return (
    cat.x < entity.x + entity.size &&
    cat.x + cat.width > entity.x &&
    cat.y < entity.y + entity.size &&
    cat.y + cat.height > entity.y
  );
}

function duckMusic(music: HTMLAudioElement | null, duration: number) {
  if (!music || music.paused) return;
  music.volume = 0.04;
  window.setTimeout(() => {
    music.volume = 0.28;
  }, duration);
}

function playRecordedMeow(meow: HTMLAudioElement | null, music: HTMLAudioElement | null) {
  if (!meow) return;
  duckMusic(music, 900);
  meow.currentTime = 0;
  meow.volume = 1;
  void meow.play().catch(() => undefined);
}

function playCrash(audioContext: AudioContext | null, music: HTMLAudioElement | null) {
  if (!audioContext || audioContext.state === 'closed') return;
  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const impact = audioContext.createOscillator();
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.24), audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let index = 0; index < noiseData.length; index += 1) {
    noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
  }
  noise.buffer = noiseBuffer;

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 0.3);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.38, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

  impact.type = 'square';
  impact.frequency.setValueAtTime(170, now);
  impact.frequency.exponentialRampToValueAtTime(42, now + 0.34);
  impact.connect(filter);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  impact.start(now);
  noise.start(now);
  impact.stop(now + 0.35);
  noise.stop(now + 0.25);
  duckMusic(music, 450);
}

function drawCat(
  context: CanvasRenderingContext2D,
  y: number,
  tick: number,
  rainbowImpulse: number,
  invulnerable: boolean,
  catImage: HTMLImageElement | null
) {
  const bob = Math.sin(tick / 110) * 3;
  const top = y - 39 + bob;
  const colors = ['#ff4f81', '#ff9f43', '#ffe66d', '#63e06f', '#45b7ff', '#a66cff'];
  colors.forEach((color, index) => {
    context.fillStyle = color;
    for (let x = 0; x < 150; x += 6) {
      const wave = Math.sin(tick / 70 + x / 18) * (2 + rainbowImpulse * 12);
      context.fillRect(x, top + 18 + index * 7 + wave, 7, 8);
    }
  });

  if (invulnerable && Math.floor(tick / 80) % 2 === 0) return;
  if (catImage?.complete && catImage.naturalWidth > 0) {
    context.imageSmoothingEnabled = false;
    context.drawImage(catImage, 271, 210, 247, 160, 135, top, 123.5, 80);
  } else {
    context.fillStyle = '#ff77b7';
    context.fillRect(145, top + 8, 100, 60);
  }
}

function drawGame(
  context: CanvasRenderingContext2D,
  game: GameState,
  tick: number,
  catImage: HTMLImageElement | null,
  foodImages: Map<string, HTMLImageElement>
) {
  const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#12062d');
  gradient.addColorStop(1, '#28105a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  for (const star of game.stars) {
    context.fillStyle = Math.floor(tick / 250 + star.x) % 2 ? '#ffffff' : '#9edbff';
    context.fillRect(star.x, star.y, star.size, star.size);
  }

  for (const treat of game.treats) {
    const image = foodImages.get(treat.food.icon);
    if (image?.complete) context.drawImage(image, treat.x, treat.y, treat.size, treat.size);
    context.fillStyle = '#ffffff';
    context.font = 'bold 13px system-ui';
    context.textAlign = 'center';
    context.fillText(
      treat.food.extraLife ? '+1 ♥' : `+${treat.food.points}`,
      treat.x + treat.size / 2,
      treat.y - 5
    );
  }

  for (const obstacle of game.obstacles) {
    context.fillStyle = '#6f6484';
    context.beginPath();
    context.arc(obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2, obstacle.size / 2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#4c435d';
    context.beginPath();
    context.arc(obstacle.x + obstacle.size * 0.35, obstacle.y + obstacle.size * 0.35, obstacle.size * 0.12, 0, Math.PI * 2);
    context.arc(obstacle.x + obstacle.size * 0.7, obstacle.y + obstacle.size * 0.62, obstacle.size * 0.17, 0, Math.PI * 2);
    context.fill();
  }

  drawCat(context, game.catY, tick, game.rainbowImpulse, tick < game.invulnerableUntil, catImage);
}

export function NyanGameModal({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const meowRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const catImageRef = useRef<HTMLImageElement | null>(null);
  const foodImagesRef = useRef(new Map<string, HTMLImageElement>());
  const gameRef = useRef<GameState>(createGame());
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const [status, setStatus] = useState<'ready' | 'playing' | 'game-over'>('ready');
  const statusRef = useRef(status);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY)) || 0);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const move = useCallback((direction: -1 | 1) => {
    if (statusRef.current === 'playing') {
      gameRef.current.velocity = direction * 330;
      gameRef.current.rainbowImpulse = 1;
    }
  }, []);

  const boost = useCallback(() => move(-1), [move]);

  const startGame = useCallback(() => {
    gameRef.current = createGame();
    lastTimeRef.current = 0;
    statusRef.current = 'playing';
    setScore(0);
    setLives(3);
    setStatus('playing');
    canvasRef.current?.focus();
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') void audioContextRef.current.resume();
    if (audioRef.current) audioRef.current.volume = 0.28;
    void audioRef.current?.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().then(() => setMusicPlaying(true));
    else {
      audio.pause();
      setMusicPlaying(false);
    }
  }, []);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const catImage = new Image();
    catImage.src = `${base}game/nyan-cat.png`;
    catImageRef.current = catImage;
    for (const food of [...FOODS, LIFE_FISH]) {
      const image = new Image();
      image.src = `${base}game/${food.icon}.svg`;
      foodImagesRef.current.set(food.icon, image);
    }
  }, []);

  useEffect(() => () => {
    const audioContext = audioContextRef.current;
    if (audioContext && audioContext.state !== 'closed') void audioContext.close();
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if ([' ', 'ArrowUp', 'w', 'W'].includes(event.key)) {
        event.preventDefault();
        move(-1);
      }
      if (['ArrowDown', 's', 'S'].includes(event.key)) {
        event.preventDefault();
        move(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, onClose]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const loop = (time: number) => {
      const game = gameRef.current;
      const delta = Math.min((time - (lastTimeRef.current || time)) / 1000, 0.034);
      lastTimeRef.current = time;

      if (statusRef.current === 'playing') {
        game.elapsed += delta;
        game.score += delta * 10;
        game.hudTimer += delta;
        game.rainbowImpulse = Math.max(0, game.rainbowImpulse - delta * 2.4);
        game.velocity += 720 * delta;
        game.catY += game.velocity * delta;
        game.catY = Math.max(34, Math.min(HEIGHT - 34, game.catY));
        if (game.catY === 34 || game.catY === HEIGHT - 34) game.velocity *= -0.35;

        game.obstacleTimer -= delta;
        game.treatTimer -= delta;
        if (game.obstacleTimer <= 0) {
          const size = 38 + Math.random() * 34;
          game.obstacles.push({ x: WIDTH + size, y: 22 + Math.random() * (HEIGHT - size - 44), size, speed: 215 + game.elapsed * 3 });
          game.obstacleTimer = Math.max(0.75, 1.6 - game.elapsed / 45);
        }
        if (game.treatTimer <= 0) {
          const food = Math.random() < 0.08
            ? LIFE_FISH
            : FOODS[Math.floor(Math.random() * FOODS.length)];
          game.treats.push({ x: WIDTH + 48, y: 36 + Math.random() * (HEIGHT - 100), size: 44, speed: 190, food });
          game.treatTimer = 1.25 + Math.random() * 1.2;
        }

        [...game.stars, ...game.obstacles, ...game.treats].forEach((entity) => {
          entity.x -= entity.speed * delta;
          if (entity.x < -entity.size && game.stars.includes(entity)) entity.x = WIDTH + entity.size;
        });
        game.obstacles = game.obstacles.filter((entity) => entity.x > -entity.size);
        game.treats = game.treats.filter((entity) => {
          if (overlaps(game.catY, entity)) {
            const reward = applyCollectibleReward(game.lives, game.score, entity.food);
            game.lives = reward.lives;
            game.score = reward.score;
            if (entity.food.extraLife) setLives(game.lives);
            if (entity.food.icon === 'shortcake-1') playRecordedMeow(meowRef.current, audioRef.current);
            return false;
          }
          return entity.x > -entity.size;
        });

        if (time >= game.invulnerableUntil) {
          const hitIndex = game.obstacles.findIndex((entity) => overlaps(game.catY, entity));
          if (hitIndex >= 0) {
            game.obstacles.splice(hitIndex, 1);
            playCrash(audioContextRef.current, audioRef.current);
            game.lives -= 1;
            game.invulnerableUntil = time + 1200;
            setLives(game.lives);
            if (game.lives <= 0) {
              const finalScore = Math.floor(game.score);
              statusRef.current = 'game-over';
              setStatus('game-over');
              setScore(finalScore);
              setBestScore((previous) => {
                const next = Math.max(previous, finalScore);
                localStorage.setItem(BEST_SCORE_KEY, String(next));
                return next;
              });
            }
          }
        }

        if (game.hudTimer >= 0.1) {
          game.hudTimer = 0;
          setScore(Math.floor(game.score));
        }
      }

      drawGame(context, game, time, catImageRef.current, foodImagesRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="nyan-game-title">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Мінігра</p>
            <h2 id="nyan-game-title">Nyan Cat: Lost In Space — демо</h2>
          </div>
          <button ref={closeRef} className={styles.close} onClick={onClose} aria-label="Закрити гру">×</button>
        </header>

        <div className={styles.hud} aria-live="polite">
          <span>Рахунок: <strong>{score}</strong></span>
          <span>Життя: <strong>{'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}</strong></span>
          <span>Рекорд: <strong>{bestScore}</strong></span>
          <button className={styles.music} onClick={toggleMusic} aria-label={musicPlaying ? 'Вимкнути музику' : 'Увімкнути музику'}>
            {musicPlaying ? '🔊' : '🔇'}
          </button>
        </div>

        <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/nyan-cat-short-loop.mp3`} loop preload="auto" />
        <audio ref={meowRef} src={`${import.meta.env.BASE_URL}audio/cat-meow.ogg`} preload="auto" />

        <div className={styles.stage}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={WIDTH}
            height={HEIGHT}
            tabIndex={0}
            aria-label="Ігрове поле: летіть крізь космос, збирайте їжу та уникайте астероїдів"
            onPointerDown={boost}
          />
          {status !== 'playing' && (
            <div className={styles.overlay}>
              <p className={styles.overlayTitle}>{status === 'game-over' ? 'Гру завершено' : 'Готові до польоту?'}</p>
              <p>Space, ↑, W або клік — вгору. ↓ або S — вниз.</p>
              <button className={styles.start} onClick={startGame}>
                {status === 'game-over' ? 'Спробувати ще раз' : 'Почати гру'}
              </button>
            </div>
          )}
        </div>

        <div className={styles.flightControls} aria-label="Керування польотом">
          <button onClick={() => move(-1)} disabled={status !== 'playing'}>↑ Вгору</button>
          <button onClick={() => move(1)} disabled={status !== 'playing'}>↓ Вниз</button>
        </div>

        <p className={styles.help}>7 видів їжі дають від 10 до 50 балів, а рідкісна рибка відновлює одне життя. Уникайте астероїдів і протримайтеся якомога довше.</p>
        <p className={styles.credits}>
          Музика: <a href="https://www.newgrounds.com/audio/listen/765452" target="_blank" rel="noreferrer">Nyan Cat (Short loop) — mutty99</a>, CC BY-NC-ND 3.0. Мяу: <a href="https://commons.wikimedia.org/wiki/File:Meow.ogg" target="_blank" rel="noreferrer">Dan Crosby</a>, CC BY-SA 3.0. Іконки їжі: Streamline Emojis, CC BY 4.0.
        </p>
      </section>
    </div>
  );
}
