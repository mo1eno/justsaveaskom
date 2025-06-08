import { CreateChatGPTRequestAction } from './CreateChatGPTRequestAction';
import { ChatGPTRequestDto } from '../dto/ChatGPTRequestDto';

const action = new CreateChatGPTRequestAction();

const testRequest: ChatGPTRequestDto = {
  originalText: 'Квартира в северном',
  crmDump: './crm_dump.json'
};

action.execute(testRequest)
  .then(response => {
    console.log('Результат:', response);
  })
  .catch(error => {
    console.error('Ошибка:', error);
  });
