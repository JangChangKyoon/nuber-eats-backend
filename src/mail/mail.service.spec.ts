import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

import got from 'got';
import * as FormData from 'form-data';

/* Mocking module */
// jest.mock('got', () => {}); // got(`https://api.mailgun.net/v3/${this.options.domain}/messages`
// jest.mock('form-data', () => {
//   return {
//     append: jest.fn(),
//   };
// });
jest.mock('got'); //got 자체를 mock
jest.mock('form-data');
const TEST_DOMAIN = 'test-domain'; //for injection test

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            // domain: 'test-domain',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };

      /** */
      jest.spyOn(service, 'sendEmail').mockImplementation(
        async () => true,
        //   {console.log('spyOn');}
      );
      //jest는 함수를 mock fn으로 만들지 않으면 , 그 함수를 spying 할 수 없음.
      // 그렇다고 sendEmail fn을 먼저 만들기도 싫음
      // 따라서 아래에서 expect를 하기 위해서는 위 코드를 작어줌
      // async :  sendEmail가 async이기 때문에..
      // mockImplementation : sendEmail함수를 모두 실행할 수 있음

      /* sendVerificationEmail(email: string, code: string)  */
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      /*
      sendVerificationEmail(email: string, code: string) {
        this.sendEmail(
          'Verify Your Email', // subject
          'nubereats', // template name
          [
            { key: 'code', value: code }, // 'code' : mailgun html 변수
            { key: 'username', value: email }, // 'username' : mailgun html 변수
          ],
        );
      */
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'nubereats',
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    it('sends email', async () => {
      const ok = await service.sendEmail('', '', [
        { key: 'attr', value: 'attrValue' },
      ]);
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      //prototype : new FormData()을 인식시킴
      expect(formSpy).toHaveBeenCalledTimes(5);
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(ok).toEqual(true);
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', '', []);
      expect(ok).toEqual(false);
    });
  });
});
