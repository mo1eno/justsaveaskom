"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAction = void 0;
class LoginAction {
    execute(loginRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('https://reqres.in/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginRequest.email,
                    password: loginRequest.password,
                }),
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.error || 'Login failed');
            }
            const data = yield response.json();
            console.log('Login successful, token:', data.token);
        });
    }
    testLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            const testRequest = {
                email: 'evуууe.holt@reqres.in',
                password: 'pisууtol',
            };
            yield this.execute(testRequest);
        });
    }
}
exports.LoginAction = LoginAction;
const loginAction = new LoginAction();
loginAction.testLogin();
