import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios'

@Injectable()
export class CurrencyService {
    constructor(private readonly configService: ConfigService) {}

    async getCurrency() {
        const apiKey = this.configService.get<string>('CURRENCY_API_KEY')
        console.log(apiKey);

        try {
            return await axios.get(`http://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=USD,EUR&base_currency=PLN`).then((response) => {
                return response.data.data
            })
        }catch(err) {
            console.log(err);
        }
    }
 }
