import fs from 'fs';
import Handlebars from 'handlebars';

export const readTemplateFile = (filename: string) => {
  return new Promise(
    (resolve: (value: any) => void, reject: (value: any) => void) => {
      fs.readFile(
        filename,
        (err: NodeJS.ErrnoException | null, data: Buffer) => {
          if (err) {
            reject(err);
            return;
          }

          const template = Handlebars.compile(data.toString());
          resolve(template);
        }
      );
    }
  );
};
