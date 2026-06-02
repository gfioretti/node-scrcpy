import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Scrcpy from '../../lib/index.js';
import path from 'path';
import fs from 'fs';
import { fileTypeFromFile } from 'file-type';

use(chaiAsPromised);

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('Scrcpy Class (integration)', function () {
  const scrcpy = new Scrcpy();

  it('should find path to scrcpy', async function () {
    const binaryPath = await scrcpy.getScrcpyBinaryPath();
    expect(binaryPath).to.be.a('string').and.to.include('scrcpy');
  });
  const testOutputFolder = path.resolve(import.meta.dirname, 'test-output');
  fs.mkdirSync(testOutputFolder, { recursive: true });

  it('should be able to start scrcpy', async function () {
    const finalPath = path.resolve(testOutputFolder, 'bogusFile');
    const proc = await scrcpy.exec({ serial: 'emulator-5554', pathToFile: finalPath });
    await proc.start();
    await delay(2000);
    expect(proc.isRunning).to.eql(true);
    await proc.stop();
    expect(proc.isRunning).to.eql(false);
  });

  it('should be able to record a mp4 video by default', async function () {
    const videoFilePath = path.resolve(testOutputFolder, 'mp4TestVideo');
    const proc = await scrcpy.exec({ serial: 'emulator-5554', pathToFile: videoFilePath });
    await proc.start();
    await delay(2000);
    expect(proc.isRunning).to.eql(true);
    await proc.stop();
    expect(proc.isRunning).to.eql(false);
    const fileTypeMap = await fileTypeFromFile(`${videoFilePath}.mp4`);
    expect(fileTypeMap?.mime).to.equal('video/mp4');
  });

  it('should be able to record a mkv video', async function () {
    const videoFilePath = path.resolve(testOutputFolder, 'mkvTestVideo');
    const proc = await scrcpy.exec({ serial: 'emulator-5554', pathToFile: videoFilePath, recordFormat: 'mkv' });
    await proc.start();
    await delay(2000);
    expect(proc.isRunning).to.eql(true);
    await proc.stop();
    expect(proc.isRunning).to.eql(false);
    const fileTypeMap = await fileTypeFromFile(`${videoFilePath}.mkv`);
    expect(fileTypeMap?.mime).to.equal('video/x-matroska');
  });
});
