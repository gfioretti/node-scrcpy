import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Scrcpy from '../lib/index';
import B from 'bluebird';

chai.should();
//const should = chai.should();
chai.use(chaiAsPromised);

describe('Scrcpy Class', function () {
  const scrcpy = new Scrcpy();
  it('should find path to scrcpy', async function () {
    const path = await scrcpy.getScrcpyBinaryPath();
    // How to assert this for all possible OS's?
    path.should.eql('/usr/local/bin/scrcpy');
  });
  it('should throw error if device udid is not provided', async function () {
    await scrcpy.exec().should.eventually.be.rejected;
  });
  it('should be able to start scrcpy', async function () {
    const options = {
      serial: 'emulator-5554'
    };
    const process = await scrcpy.exec(options);
    await process.start();
    await B.delay(2000).then(() => {
      process.isRunning.should.eql(true);
    });
  });
});