import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scrcpy, ScrcpyOptions } from '../../lib/index.js';
import { SubProcess } from 'teen_process';

use(chaiAsPromised);

const FAKE_BINARY = '/fake/scrcpy';

function makeScrcpy(): { scrcpy: Scrcpy; lastCall: () => { cmd: string; args: string[] } } {
  let captured = { cmd: '', args: [] as string[] };
  const scrcpy = new Scrcpy({
    which: async () => FAKE_BINARY,
    createProcess: (cmd, args) => {
      captured = { cmd, args };
      return {} as SubProcess;
    },
  });
  return { scrcpy, lastCall: () => captured };
}

describe('Scrcpy command building', function () {
  it('should pass the binary path as the process command', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out' });
    expect(lastCall().cmd).to.equal(FAKE_BINARY);
  });

  it('should include --serial and --record with default mp4 format', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out' });
    const { args } = lastCall();
    expect(args).to.include.members(['--serial', 'dev1', '--record', '/tmp/out.mp4']);
  });

  it('should add --no-display by default', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out' });
    expect(lastCall().args).to.include('--no-display');
  });

  it('should omit --no-display when noDisplay is true', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', noDisplay: true });
    expect(lastCall().args).not.to.include('--no-display');
  });

  it('should add --bit-rate with M suffix when bitRate is provided', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', bitRate: 8 });
    const { args } = lastCall();
    expect(args).to.include.members(['--bit-rate', '8M']);
  });

  it('should add --max-fps when maxFps is provided', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', maxFps: 60 });
    expect(lastCall().args).to.include.members(['--max-fps', '60']);
  });

  it('should add --record-format and use mkv extension for mkv format', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', recordFormat: 'mkv' });
    const { args } = lastCall();
    expect(args).to.include.members(['--record-format', 'mkv', '--record', '/tmp/out.mkv']);
  });

  it('should ignore invalid recordFormat and fall back to mp4', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', recordFormat: 'avi' });
    const { args } = lastCall();
    expect(args).not.to.include('--record-format');
    expect(args).to.include('/tmp/out.mp4');
  });

  it('should add --render-driver for a valid driver', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', renderDriver: 'opengl' });
    expect(lastCall().args).to.include.members(['--render-driver', 'opengl']);
  });

  it('should ignore invalid renderDriver', async function () {
    const { scrcpy, lastCall } = makeScrcpy();
    await scrcpy.exec({ serial: 'dev1', pathToFile: '/tmp/out', renderDriver: 'vulkan' });
    expect(lastCall().args).not.to.include('--render-driver');
  });

  it('should throw when serial is missing', async function () {
    const { scrcpy } = makeScrcpy();
    await expect(scrcpy.exec({ pathToFile: '/tmp/out' })).to.eventually.be.rejectedWith('udid');
  });

  it('should throw when pathToFile is missing', async function () {
    const { scrcpy } = makeScrcpy();
    await expect(scrcpy.exec({ serial: 'dev1' })).to.eventually.be.rejectedWith('path to file');
  });
});
