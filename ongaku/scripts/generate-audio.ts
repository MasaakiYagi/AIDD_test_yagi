import { writeFileSync } from 'fs';
import { join } from 'path';

// 簡単な正弦波を生成する関数
function generateSineWave(frequency: number, duration: number, sampleRate: number = 44100): Float32Array {
  const samples = duration * sampleRate;
  const buffer = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    buffer[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }
  return buffer;
}

// WAVファイルのヘッダーを生成する関数
function createWavHeader(dataLength: number, sampleRate: number = 44100): Buffer {
  const buffer = Buffer.alloc(44);

  // "RIFF" チャンク
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(dataLength + 36, 4);
  buffer.write('WAVE', 8);

  // "fmt " チャンク
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt チャンクのサイズ
  buffer.writeUInt16LE(1, 20); // オーディオフォーマット (1 = PCM)
  buffer.writeUInt16LE(1, 22); // チャンネル数
  buffer.writeUInt32LE(sampleRate, 24); // サンプルレート
  buffer.writeUInt32LE(sampleRate * 2, 28); // バイトレート
  buffer.writeUInt16LE(2, 32); // ブロックサイズ
  buffer.writeUInt16LE(16, 34); // ビット深度

  // "data" チャンク
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// 音声ファイルを生成する関数
function generateAudioFile(filename: string, frequency: number, duration: number) {
  const sampleRate = 44100;
  const samples = generateSineWave(frequency, duration, sampleRate);
  
  // Float32Array を Int16Array に変換
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    pcm[i] = samples[i] * 32767;
  }
  
  // WAVファイルのヘッダーを生成
  const header = createWavHeader(pcm.length * 2, sampleRate);
  
  // ヘッダーとデータを結合
  const wavFile = Buffer.concat([
    header,
    Buffer.from(pcm.buffer)
  ]);
  
  // ファイルを保存
  writeFileSync(filename, wavFile);
}

// 保存先ディレクトリを作成
const publicDir = join(process.cwd(), 'public', 'audio');
try {
  require('fs').mkdirSync(publicDir, { recursive: true });
} catch (error) {
  console.error('Error creating directory:', error);
}

// 各曲のダミー音声ファイルを生成
const songs = [
  { filename: 'cyber-sunset.wav', frequency: 440, duration: 3 }, // A4
  { filename: 'electric-waves.wav', frequency: 493.88, duration: 3 }, // B4
  { filename: 'midnight-serenade.wav', frequency: 523.25, duration: 3 }, // C5
  { filename: 'starlight-dance.wav', frequency: 587.33, duration: 3 }, // D5
  { filename: 'future-rhythm.wav', frequency: 659.25, duration: 3 }, // E5
  { filename: 'digital-pulse.wav', frequency: 698.46, duration: 3 }, // F5
  { filename: 'ocean-of-sound.wav', frequency: 783.99, duration: 3 }, // G5
  { filename: 'harmonic-flow.wav', frequency: 880, duration: 3 }, // A5
];

// 音声ファイルを生成
songs.forEach(song => {
  const filepath = join(publicDir, song.filename);
  generateAudioFile(filepath, song.frequency, song.duration);
  console.log(`Generated: ${song.filename}`);
}); 