import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Scrcpy from '../lib/index.js';
import path from 'path';
import fs from 'fs';
import { fileTypeFromFile } from 'file-type';

chai.should();
chai.use(chaiAsPromised);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Scrcpy Class', function () {
  const scrcpy = new Scrcpy();
  const testOutputFolder = path.resolve(import.meta.dirname, 'test-output');
  fs.mkdirSync(testOutputFolder, { recursive: true });

  it('should find path to scrcpy', async function () {
    const binaryPath = await scrcpy.getScrcpyBinaryPath();
    binaryPath.should.eql('/usr/local/bin/scrcpy');
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
    const options = {
      serial: 'emulator-5554',
      pathToFile: finalPath
    };
    const proc = await scrcpy.exec(options);
    await proc.start();
    await delay(2000);
    proc.isRunning.should.eql(true);
    await proc.stop();
    proc.isRunning.should.eql(false);
  });

  it('should be able to record a mp4 video by default', async function () {
    const videoFilePath = path.resolve(testOutputFolder, 'mp4TestVideo');
    const options = {
      serial: 'emulator-5554',
      pathToFile: videoFilePath
    };
    const proc = await scrcpy.exec(options);
    await proc.start();
    await delay(2000);
    proc.isRunning.should.eql(true);
    await proc.stop();
    proc.isRunning.should.eql(false);
    const fileTypeMap = await fileTypeFromFile(`${videoFilePath}.mp4`);
    fileTypeMap.mime.should.be.equal('video/mp4');
  });

  it('should be able to record a mkv video', async function () {
    const videoFilePath = path.resolve(testOutputFolder, 'mkvTestVideo');
    const options = {
      serial: 'emulator-5554',
      pathToFile: videoFilePath,
      recordFormat: 'mkv'
    };
    const proc = await scrcpy.exec(options);
    await proc.start();
    await delay(2000);
    proc.isRunning.should.eql(true);
    await proc.stop();
    proc.isRunning.should.eql(false);
    const fileTypeMap = await fileTypeFromFile(`${videoFilePath}.mkv`);
    fileTypeMap.mime.should.be.equal('video/x-matroska');
  });
});