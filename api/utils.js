import path from 'path';

export const projectDir = '/var/www/ezyo-server-manager/';

export const getMetaFilePath = (projectName) => 
  path.isAbsolute(projectName) 
  ? path.join(projectName, '.ezyoservermanager') 
  : path.join(projectDir, projectName, '.ezyoservermanager');
