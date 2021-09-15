import { RenderErrorPageParam } from '../types';
import fs from 'fs';
import { Http } from '@status/codes';

export const renderErrorPage = (param: RenderErrorPageParam) => {
  fs.readFile(
    'src/views/error-page.hbs',
    { encoding: 'utf-8' },
    (error, data) => {
      if (error) {
        console.error(error);
        param.response.status(Http.InternalServerError).send(error);
        return;
      }

      const template = Handlebars.compile(data);
      param.response
        .status(param.statusCode)
        .send(
          template({
            statusCode: param.statusCode,
            summary: param.summary,
            description: param.description,
            referer: param.referer,
          })
        )
        .end();
    }
  );
};
