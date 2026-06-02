import which from 'which';
import { SubProcess } from 'teen_process';
import log from './logger.js';

const VALID_RECORD_FORMATS = ['mp4', 'mkv'] as const;
const VALID_RENDER_DRIVERS = ['direct3d', 'opengl', 'opengles2', 'opengles', 'metal', 'software'] as const;

type RecordFormat = (typeof VALID_RECORD_FORMATS)[number];
type RenderDriver = (typeof VALID_RENDER_DRIVERS)[number];

export interface ScrcpyOptions {
  bitRate?: string | number;
  maxFps?: string | number;
  recordFormat?: string;
  serial?: string;
  noDisplay?: boolean;
  renderDriver?: string;
  pathToFile?: string;
}

interface Deps {
  which: (cmd: string) => Promise<string>;
  createProcess: (cmd: string, args: string[]) => SubProcess;
}

function isRecordFormat(val: string): val is RecordFormat {
  return (VALID_RECORD_FORMATS as readonly string[]).includes(val);
}

function isRenderDriver(val: string): val is RenderDriver {
  return (VALID_RENDER_DRIVERS as readonly string[]).includes(val);
}

class Scrcpy {
  private scrcpyPath?: string;
  recordFormat: RecordFormat = 'mp4';
  private readonly deps: Deps;

  constructor(deps: Partial<Deps> = {}) {
    this.deps = {
      which: (cmd) => which(cmd),
      createProcess: (cmd, args) => new SubProcess(cmd, args),
      ...deps,
    };
  }

  async getScrcpyBinaryPath(): Promise<string> {
    if (!this.scrcpyPath) {
      try {
        this.scrcpyPath = await this.deps.which('scrcpy');
      } catch {
        throw new Error(`Can't find Scrcpy in PATH. Please verify if you have Scrcpy installed.`);
      }
    }
    return this.scrcpyPath!;
  }

  async exec(opts: ScrcpyOptions = {}): Promise<SubProcess> {
    const scrcpyPath = await this.getScrcpyBinaryPath();
    const cmd: string[] = [];
    const { bitRate, maxFps, recordFormat, serial, noDisplay, renderDriver, pathToFile } = opts;

    if (bitRate != null) {
      cmd.push('--bit-rate', `${String(bitRate)}M`);
    }
    if (maxFps != null) {
      cmd.push('--max-fps', String(maxFps));
    }
    if (recordFormat != null) {
      if (isRecordFormat(recordFormat)) {
        this.recordFormat = recordFormat;
        cmd.push('--record-format', this.recordFormat);
      } else {
        log.info(`Record format provided ${recordFormat} is not valid. Valid formats are: mkv or mp4. Falling back to default mp4 format.`);
      }
    }
    if (serial != null) {
      cmd.push('--serial', serial);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a udid.`);
    }
    if (!noDisplay) {
      cmd.push('--no-display');
    }
    if (renderDriver != null) {
      if (isRenderDriver(renderDriver)) {
        cmd.push('--render-driver', renderDriver);
      } else {
        log.info(`Render driver ${renderDriver} is not a valid engine. Valid engines are: ${VALID_RENDER_DRIVERS.join(', ')}.`);
      }
    }
    if (pathToFile != null) {
      cmd.push('--record', `${pathToFile}.${this.recordFormat}`);
    } else {
      throw new Error(`Can't start Scrcpy screen recording without a path to file.`);
    }

    log.info(`Starting new scrcpy process with command ${cmd.join(' ')}`);
    return this.deps.createProcess(scrcpyPath, cmd);
  }
}

export default Scrcpy;
export { Scrcpy };
