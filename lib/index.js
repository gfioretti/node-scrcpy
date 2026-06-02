import which from 'which';
import { SubProcess } from 'teen_process';
import log from './logger.js';

const VALID_RECORD_FORMATS = ['mp4', 'mkv'];
const VALID_RENDER_DRIVERS = ['direct3d', 'opengl', 'opengles2', 'opengles', 'metal', 'software'];

function hasValue(val) {
  return val !== null && val !== undefined;
}

class Scrcpy {
  constructor() {
    this.recordFormat = 'mp4';
  }

  async getScrcpyBinaryPath() {
    if (!this.scrcpyPath) {
      try {
        this.scrcpyPath = await which('scrcpy');
      } catch {
        throw new Error(`Can't find Scrcpy in PATH. Please verify if you have Scrcpy installed.`);
      }
    }
    return this.scrcpyPath;
  }

  /**
   * @typedef {Object} ScrcpyOptions
   * @property {?string|number} bitRate - Optional video bitrate value.
   * @property {?string|number} maxFps - Optional video framerate value.
   * @property {?string} recordFormat - Optional video codec, can be either mp4 or mkv. Default value is mp4.
   * @property {string} serial - Target device udid.
   * @property {?boolean} noDisplay - Boolean to enable video display. Should be set to False to enable display
   *                                  as it is disabled by default to save resources.
   * @property {string} renderDriver - Supported names are currently "direct3d", "opengl", "opengles2", "opengles", "metal" and "software".
   *                                   See <https://wiki.libsdl.org/SDL_HINT_RENDER_DRIVER>
   * @property {string} pathToFile - Destination of the output video file.
   */
  /**
   * @param {?ScrcpyOptions} opts [{}]
   * @throws Throw an error if user does not provide a target device udid.
   * @throws Throw an error if user does not specify a path to the file to be created.
   * @returns {SubProcess} scrcpy process, which can be then controlled by the client code
   */
  async exec(opts = {}) {
    const scrcpyPath = await this.getScrcpyBinaryPath();
    const cmd = [];
    const { bitRate, maxFps, recordFormat, serial, noDisplay, renderDriver, pathToFile } = opts;

    if (hasValue(bitRate)) {
      cmd.push('--bit-rate', `${String(bitRate)}M`);
    }
    if (hasValue(maxFps)) {
      cmd.push('--max-fps', maxFps);
    }
    if (hasValue(recordFormat)) {
      if (VALID_RECORD_FORMATS.includes(recordFormat)) {
        this.recordFormat = recordFormat;
        cmd.push('--record-format', this.recordFormat);
      } else {
        log.info(`Record format provided ${recordFormat} is not valid. Valid formats are: mkv or mp4. Falling back to default mp4 format.`);
      }
    }
    if (hasValue(serial)) {
      cmd.push('--serial', serial);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a udid.`);
    }
    if (!noDisplay) {
      cmd.push('--no-display');
    }
    if (hasValue(renderDriver)) {
      if (VALID_RENDER_DRIVERS.includes(renderDriver)) {
        cmd.push('--render-driver', renderDriver);
      } else {
        log.info(`Render driver ${renderDriver} is not a valid engine. Valid engines are: ${VALID_RENDER_DRIVERS.join(', ')}.`);
      }
    }
    if (hasValue(pathToFile)) {
      cmd.push('--record', `${pathToFile}.${this.recordFormat}`);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a path to file.`);
    }

    log.info(`Starting new scrcpy process with command ${cmd.join(' ')}`);
    return new SubProcess(scrcpyPath, cmd);
  }
}

export default Scrcpy;
export { Scrcpy };