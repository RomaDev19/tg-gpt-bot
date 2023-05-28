import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { removeFile } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url)); //for method create || __dirname - locale folder

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path); //make path to convector
  }

  toMp3(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`); // path to folde voices
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            removeFile(input);
            resolve(outputPath);
          }) //path to mp3 file
          .on('error', (err) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.log('Error in method toMp3', e.message);
    }
  }

  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`); //safe ogg files to folder voices
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);

        stream.on('finish', () => resolve(oggPath));
      });
    } catch (e) {
      console.log('Error', e.message);
    }
  }
}

export const ogg = new OggConverter();
