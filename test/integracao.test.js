import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./utils/consultarCep.js', () => ({
    consultarCep: vi.fn()
}));

import app from '../src/app.js';
import request from 'supertest';

import { ClienteFactory } from './factories/ClienteFactory.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { VeiculoFactory } from './factories/VeiculoFactory.js';
import { clearDatabase } from './utils/clearDatabase.js';
import { consultarCep } from './utils/consultarCep.js';

describe('API de montadoras', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.resetAllMocks();
    });

    it('deve criar uma montadora com sucesso.', async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: 'Ferrari',
                pais: 'Itália'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Montadora criada com sucesso');
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('deve atualizar uma montadora com sucesso.', async () => {
        const montadora = await MontadoraFactory.create('Toyota', 'Japão');

        const response = await request(app)
            .put(`/montadoras?id=${montadora.id}`)
            .send({
                nome: 'Ferrari',
                pais: 'Itália'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Montadora atualizada com sucesso');
    });
});

describe('API de clientes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.resetAllMocks();
    });

    it('deve criar um cliente com sucesso.', async () => {
        consultarCep.mockResolvedValue({
            cep: '13185880',
            logradouro: 'Rua Teste',
            bairro: 'Centro',
            cidade: 'Hortolândia',
            uf: 'SP'
        });

        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Florisvaldo Junior',
                cpf: '12345678900',
                cep: '13185880',
                numero: 123,
                complemento: 'Apenas um teste!'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Cliente criado com sucesso');
        expect(response.body.data).toHaveProperty('insertId');
        expect(consultarCep).toHaveBeenCalled();
    });

    it('deve atualizar um cliente com sucesso.', async () => {
        const cliente = await ClienteFactory.create(
            'Florisvaldo Junior',
            '12345678900',
            '13185880',
            'Rua Teste',
            'Centro',
            'Hortolândia',
            'SP',
            123,
            'Apenas um teste!'
        );

        consultarCep.mockResolvedValue({
            cep: '13185881',
            logradouro: 'Rua Teste',
            bairro: 'Centro',
            cidade: 'Hortolândia',
            uf: 'SP'
        });

        const response = await request(app)
            .put(`/clientes?id=${cliente.id}`)
            .send({
                nome: 'Florisvaldo Antonio',
                cpf: '12345678900',
                cep: '13185881',
                numero: 1234,
                complemento: 'Novo complemento'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cliente atualizado com sucesso');
        expect(consultarCep).toHaveBeenCalled();
    });

    it('deve cadastrar um cliente com CEP válido.', async () => {
        consultarCep.mockResolvedValue({
            cep: '13185880',
            logradouro: 'Rua Teste',
            bairro: 'Centro',
            cidade: 'Hortolândia',
            uf: 'SP'
        });

        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Florisvaldo Junior',
                cpf: '12345678900',
                cep: '13185880',
                numero: 123,
                complemento: 'Apenas um teste!'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Cliente criado com sucesso');
        expect(response.body.data).toHaveProperty('insertId');
        expect(consultarCep).toHaveBeenCalled();
    });

    it('não deve cadastrar um cliente com CEP inválido.', async () => {
        consultarCep.mockRejectedValue(new Error('CEP não encontrado'));

        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Florisvaldo Junior',
                cpf: '12345678900',
                cep: '00000000',
                numero: 123,
                complemento: 'Apenas um teste!'
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Erro ao criar cliente');
        expect(consultarCep).toHaveBeenCalled();
    });

    it('não deve cadastrar um cliente sem preencher campos obrigatórios.', async () => {
        consultarCep.mockRejectedValue(new Error('CEP inválido'));

        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Florisvaldo Junior',
                cpf: '12345678900',
                numero: 123,
                complemento: 'Apenas um teste!'
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Erro ao criar cliente');
    });

    it('não deve atualizar um cliente inexistente.', async () => {
        consultarCep.mockResolvedValue({
            cep: '13185881',
            logradouro: 'Rua Teste',
            bairro: 'Centro',
            cidade: 'Hortolândia',
            uf: 'SP'
        });

        const response = await request(app)
            .put('/clientes?id=999999')
            .send({
                nome: 'Florisvaldo Antonio',
                cpf: '12345678900',
                cep: '13185881',
                numero: 1234,
                complemento: 'Novo complemento'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cliente atualizado com sucesso');
    });
});

describe('API de veículos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.resetAllMocks();
    });

    it('deve cadastrar um veículo com sucesso.', async () => {
        const montadora = await MontadoraFactory.create('Ferrari', 'Itália');

        const cliente = await ClienteFactory.create(
            'Florisvaldo Junior',
            '12345678900',
            '13185880',
            'Rua Teste',
            'Centro',
            'Hortolândia',
            'SP',
            123,
            'Apenas um teste!'
        );

        const response = await request(app)
            .post('/veiculos')
            .send({
                idMontadora: montadora.id,
                idCliente: cliente.id,
                modelo: 'Palio',
                placa: 'EAG-2356',
                ano: 2010,
                cor: 'Preto',
                valor: 20000
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Veículo criado com sucesso');
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('deve atualizar um veículo com sucesso.', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const cliente = await ClienteFactory.create(
            'Florisvaldo Junior',
            '12345678900',
            '13185880',
            'Rua Teste',
            'Centro',
            'Hortolândia',
            'SP',
            123,
            'Apenas um teste!'
        );

        const veiculo = await VeiculoFactory.create(
            'Palio',
            'XYZ-1234',
            2010,
            'Preto',
            20000,
            cliente.id,
            montadora.id
        );

        const response = await request(app)
            .put(`/veiculos?id=${veiculo.id}`)
            .send({
                idMontadora: montadora.id,
                idCliente: cliente.id,
                modelo: 'Palio GT',
                placa: 'ABC-2356',
                ano: 2009,
                cor: 'Prata',
                valor: 25000
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Veículo atualizado com sucesso');
    });

    it('não deve cadastrar um veículo com placa já cadastrada.', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const cliente = await ClienteFactory.create(
            'Florisvaldo Junior',
            '12345678900',
            '13185880',
            'Rua Teste',
            'Centro',
            'Hortolândia',
            'SP',
            123,
            'Apenas um teste!'
        );

        await VeiculoFactory.create(
            'Palio',
            'ABC-1234',
            2010,
            'Preto',
            20000,
            cliente.id,
            montadora.id
        );

        const response = await request(app)
            .post('/veiculos')
            .send({
                idMontadora: montadora.id,
                idCliente: cliente.id,
                modelo: 'Palio GT',
                placa: 'ABC-1234',
                ano: 2009,
                cor: 'Prata',
                valor: 25000
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Placa já cadastrada');
    });

    it('não deve atualizar um veículo inexistente.', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const cliente = await ClienteFactory.create(
            'Florisvaldo Junior',
            '12345678900',
            '13185880',
            'Rua Teste',
            'Centro',
            'Hortolândia',
            'SP',
            123,
            'Apenas um teste!'
        );

        const response = await request(app)
            .put('/veiculos?id=999999')
            .send({
                idMontadora: montadora.id,
                idCliente: cliente.id,
                modelo: 'Palio GT',
                placa: 'ABC-2356',
                ano: 2009,
                cor: 'Prata',
                valor: 25000
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Veículo não encontrado');
    });
});