import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Scrcpy from '../lib/index';
import B from 'bluebird';
import path from 'path';
import fs from 'fs';
import fileType from 'file-type';
//import * as support from 'appium-support';

chai.should();
chai.use(chaiAsPromised);

describe('Scrcpy Class', function () {
  const scrcpy = new Scrcpy();
  const testOutputFolder = path.resolve(__dirname, 'test-output');
  fs.mkdirSync(testOutputFolder, { recursive: true });
  it('should find path to scrcpy', async function () {
    const path = await scrcpy.getScrcpyBinaryPath();
    // How to assert this for all possible OS's?
    path.should.eql('/usr/local/bin/scrcpy');
  });
  it('should throw error if device udid is not provided', async function () {
    await scrcpy.exec().should.eventually.be.rejected;
  });
  it('should throw error if path to file is not provided', async function () {
    const options = {
      serial: 'emulator-5554'
    };
    await scrcpy.exec(options).should.eventually.be.rejected;
  });
  it('should be able to start scrcpy', async function () {
    const finalPath = path.resolve(testOutputFolder, 'bogusFile');
    const finalString = new String(finalPath);
    const options = {
      serial: 'emulator-5554',
      pathToFile: finalString
    };
    const process = await scrcpy.exec(options);
    await process.start();
    await B.delay(2000).then(() => {
      process.isRunning.should.eql(true);
    });
    await process.stop();
    process.isRunning.should.eql(false);
  });
  it('should be able to record a mp4 video by default', async function () {
    const videoFilePath = path.resolve(testOutputFolder, 'mp4TestVideo');
    const videoFilePathAsString = new String(videoFilePath);
    const options = {
      serial: 'emulator-5554',
      pathToFile: videoFilePathAsString
    };
    const process = await scrcpy.exec(options);
    await process.start();
    await B.delay(2000).then(() => {
      process.isRunning.should.eql(true);
    });
    await process.stop();
    process.isRunning.should.eql(false);
    const fileTypeMap = await fileType.fromFile(`${videoFilePathAsString}.mp4`);
    fileTypeMap.mime.should.be.equal('video/mp4');
  });
  it('should be able to record a mkv video', async function () {
    const videoFilePath = path.resolve(testOutputFolder, 'mkvTestVideo');
    const videoFilePathAsString = new String(videoFilePath);
    const options = {
      serial: 'emulator-5554',
      pathToFile: videoFilePathAsString,
      recordFormat: 'mkv'
    };
    const process = await scrcpy.exec(options);
    await process.start();
    await B.delay(2000).then(() => {
      process.isRunning.should.eql(true);
    });
    await process.stop();
    process.isRunning.should.eql(false);
    const fileTypeMap = await fileType.fromFile(`${videoFilePathAsString}.mkv`);
    fileTypeMap.mime.should.be.equal('video/x-matroska');
  });
});