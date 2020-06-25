import { fs, util } from 'appium-support';
import { SubProcess } from 'teen_process';
import log from './logger';

class Scrcpy {
  constructor () {
    this.recordFormat = 'mp4';
  }
  async getScrcpyBinaryPath () {
    if (!this.scrcpyPath) {
      try {
        this.scrcpyPath = await fs.which('scrcpy');
      } catch (e) {
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
  async exec (opts = {}) {
    const scrcpyPath = await this.getScrcpyBinaryPath();
    const cmd = [];
    const {
      bitRate,
      maxFps,
      recordFormat,
      serial,
      noDisplay,
      renderDriver,
      pathToFile
    } = opts;
    if (util.hasValue(bitRate)) {
      cmd.push('--bit-rate', `${new String(bitRate)}M`);
    }
    if (util.hasValue(maxFps)) {
      cmd.push('--max-fps', maxFps);
    }
    if (util.hasValue(recordFormat)) {
      if (recordFormat === 'mkv' || recordFormat === 'mp4') {
        this.recordFormat = recordFormat;
        cmd.push('--record-format', this.recordFormat);
      } else {
        log.info(`Record format provided ${recordFormat} is not valid. Valid formats are: mkv or mp4. Falling back to default mp4 format.`);
      }
    }
    if (util.hasValue(serial)) {
      cmd.push('--serial', serial);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a udid.`);
    }
    if (!noDisplay) {
      cmd.push('--no-display');
    }
    if (util.hasValue(renderDriver)) {
      if (renderDriver === 'direct3d' || renderDriver === 'opengl' || renderDriver === 'opengles2' || renderDriver === 'metal' || renderDriver === 'software') {
        cmd.push('--render-driver', renderDriver);
      } else {
        // If provided render driver is not valid, let if fallback to default engine and just let user know that provided string is invalid.
        log.info(`Render driver ${renderDriver} is not a valid engine. Valid engines are: direct3d, opengl, opengles2, metal or software.`);
      }
    }
    if (util.hasValue(pathToFile)) {
      cmd.push('--record', `${pathToFile}.${this.recordFormat}`);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a path to file.`);
    }
    log.info(`Starting new scrcpy process with command ${util.quote(cmd)}`);
    return new SubProcess(scrcpyPath, cmd);

  }
}

export default Scrcpy;
export { Scrcpy };