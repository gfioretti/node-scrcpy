import { fs, util } from 'appium-support';
import { SubProcess } from 'teen_process';
import log from './logger';

class Scrcpy {
  constructor () {
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
      noDisplay
    } = opts;
    if (util.hasValue(bitRate)) {
      cmd.push('--bit-rate', bitRate);
    }
    if (util.hasValue(maxFps)) {
      cmd.push('--max-fps', maxFps);
    }
    if (util.hasValue(recordFormat)) {
      cmd.push('--record-format', recordFormat);
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
    // should replace hardcoded file with provided path at function level
    cmd.push('--record', 'file.mp4');
    log.debug(`Starting new scrcpy process with command ${util.quote(cmd)}`);
    return new SubProcess(scrcpyPath, cmd);
  }
}

export default Scrcpy;
export { Scrcpy };