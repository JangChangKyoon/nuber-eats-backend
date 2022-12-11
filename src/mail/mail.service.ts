import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // console.log(options);
    // this.sendEmail('testing', 'test');
  }

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', `jachky22@daum.net`); // 받을 사람 이메일주소
    form.append('subject', subject); // 메일제목 설정
    // form.append('text', content); // 메일 내용 설정
    // form.append('template', 'nubereats'); // mailgun template 변수
    // form.append('v:code', 'asasas'); // mailgun template html 변수
    // form.append('v:username', 'Jack'); // mailgun template html 변수
    form.append('template', template); // mailgun template 변수
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
          //API내역서 가장 위 부분 : curl -s --user 'api:YOUR_API_KEY' \
          // 여기서 --user은 Basic을 의미하며 유저명과 패스워드를 필요로 함
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
    // console.log(response.body);
  }

  //위 sendEmail을 호출하는 함수
  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      'Verify Your Email', // subject
      'nubereats', // template name
      [
        { key: 'code', value: code }, // 'code' : mailgun html 변수
        { key: 'username', value: email }, // 'username' : mailgun html 변수
      ],
    );
  }
}
