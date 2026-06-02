import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Scrcpy from '../../lib/index.js';

use(chaiAsPromised);

describe('Scrcpy Class', function () {
  const scrcpy = new Scrcpy();

  it('should find path to scrcpy', async function () {
    const binaryPath = await scrcpy.getScrcpyBinaryPath();
    expect(binaryPath).to.be.a('string').and.to.include('scrcpy');
  });

  it('should throw error if device udid is not provided', async function () {
    await expect(scrcpy.exec()).to.eventually.be.rejected;
  });

  it('should throw error if path to file is not provided', async function () {
    await expect(scrcpy.exec({ serial: 'emulator-5554' })).to.eventually.be.rejected;
  });
});
