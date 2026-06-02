import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Scrcpy from '../../lib/index.js';
import { SubProcess } from 'teen_process';

use(chaiAsPromised);

describe('Scrcpy Class', function () {
  const fakeDeps = {
    which: async () => '/fake/scrcpy',
    createProcess: () => ({} as SubProcess),
  };

  it('should cache the binary path after the first lookup', async function () {
    let callCount = 0;
    const scrcpy = new Scrcpy({
      which: async () => { callCount++; return '/fake/scrcpy'; },
      createProcess: () => ({} as SubProcess),
    });
    await scrcpy.getScrcpyBinaryPath();
    await scrcpy.getScrcpyBinaryPath();
    expect(callCount).to.equal(1);
  });

  it('should throw when scrcpy binary is not found', async function () {
    const scrcpy = new Scrcpy({
      which: async () => { throw new Error('not found'); },
      createProcess: () => ({} as SubProcess),
    });
    await expect(scrcpy.getScrcpyBinaryPath()).to.eventually.be.rejectedWith('PATH');
  });

  it('should throw when serial is not provided', async function () {
    const scrcpy = new Scrcpy(fakeDeps);
    await expect(scrcpy.exec()).to.eventually.be.rejected;
  });

  it('should throw when pathToFile is not provided', async function () {
    const scrcpy = new Scrcpy(fakeDeps);
    await expect(scrcpy.exec({ serial: 'emulator-5554' })).to.eventually.be.rejected;
  });
});
