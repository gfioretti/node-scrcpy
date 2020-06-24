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
  async exec (opts = {}) {
    const scrcpyPath = await this.getScrcpyBinaryPath();
    const cmd = [];
    const {
      bitRate,
      maxFps,
      recordFormat,
      serial,
      showTouches,
      noDisplay,
      renderDriver,
      pathToFile
    } = opts;
    if (util.hasValue(bitRate)) {
      cmd.push('--bit-rate', bitRate);
    }
    if (util.hasValue(maxFps)) {
      cmd.push('--max-fps', maxFps);
    }
    // Valid formats: mp4 or mkv
    if (util.hasValue(recordFormat)) {
      if (recordFormat === 'mkv' || recordFormat === 'mp4') {
        this.recordFormat = recordFormat;
        cmd.push('--record-format', recordFormat);
      } else {
        log.info(`Record format provided ${recordFormat} is not valid. Valid formats are: mkv or mp4. Falling back to default mp4 format.`);
      }
    }
    if (util.hasValue(serial)) {
      cmd.push('--serial', serial);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a udid.`);
    }
    if (util.hasValue(showTouches)) {
      cmd.push('--show-touches', showTouches);
    }
    // Screen should be disabled by default in order to save resources, unless specified by user
    if (!util.hasValue(noDisplay)) {
      cmd.push('--no-display');
    }
    //Supported names are currently "direct3d", "opengl", "opengles2", "opengles", "metal" and "software".
    //<https://wiki.libsdl.org/SDL_HINT_RENDER_DRIVER>
    if (util.hasValue(renderDriver)) {
      if (renderDriver === 'direct3d' || renderDriver === 'opengl' || renderDriver === 'opengles2' || renderDriver === 'metal' || renderDriver === 'software') {
        cmd.push('--render-driver', renderDriver);
      } else {
        // If provided render driver is not valid, let if fallback to default engine and just let user know that provided string is invalid.
        log.info(`Render driver ${renderDriver} is not a valid engine. Valid engines are: direct3d, opengl, opengles2, metal or software.`);
      }
    }
    // should replace hardcoded file with provided path at function level
    if (util.hasValue(pathToFile)) {
      cmd.push('--record', `${pathToFile}.${this.recordFormat}`);
    } else {
      // Throw an error if user does no specify a path to the file to be created.
      throw new Error(`Can't start Scrcpy screen recording without a path to file.`);
    }
    log.info(`Starting new scrcpy process with command ${util.quote(cmd)}`);
    return new SubProcess(scrcpyPath, cmd);

  }
}

export default Scrcpy;
export { Scrcpy };