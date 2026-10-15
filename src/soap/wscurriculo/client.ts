import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { WsCurriculoGetCurriculoCompactado } from "./definitions/WsCurriculoGetCurriculoCompactado";
import { WsCurriculoGetCurriculoCompactadoResponse } from "./definitions/WsCurriculoGetCurriculoCompactadoResponse";
import { WsCurriculoGetCurriculoCompactadoPorUsuario } from "./definitions/WsCurriculoGetCurriculoCompactadoPorUsuario";
import { WsCurriculoGetCurriculoCompactadoPorUsuarioResponse } from "./definitions/WsCurriculoGetCurriculoCompactadoPorUsuarioResponse";
import { WsCurriculoGetDataAtualizacaoCv } from "./definitions/WsCurriculoGetDataAtualizacaoCv";
import { WsCurriculoGetDataAtualizacaoCvResponse } from "./definitions/WsCurriculoGetDataAtualizacaoCvResponse";
import { WsCurriculoGetDataAtualizacaoCvPorUsuario } from "./definitions/WsCurriculoGetDataAtualizacaoCvPorUsuario";
import { WsCurriculoGetDataAtualizacaoCvPorUsuarioResponse } from "./definitions/WsCurriculoGetDataAtualizacaoCvPorUsuarioResponse";
import { WsCurriculoGetIdentificadorCnPq } from "./definitions/WsCurriculoGetIdentificadorCnPq";
import { WsCurriculoGetIdentificadorCnPqResponse } from "./definitions/WsCurriculoGetIdentificadorCnPqResponse";
import { WsCurriculoGetIdentificadorCnPqPorUsuario } from "./definitions/WsCurriculoGetIdentificadorCnPqPorUsuario";
import { WsCurriculoGetIdentificadorCnPqPorUsuarioResponse } from "./definitions/WsCurriculoGetIdentificadorCnPqPorUsuarioResponse";
import { WsCurriculoGetOcorrenciaCv } from "./definitions/WsCurriculoGetOcorrenciaCv";
import { WsCurriculoGetOcorrenciaCvResponse } from "./definitions/WsCurriculoGetOcorrenciaCvResponse";
import { WsCurriculoGetOcorrenciaCvPorUsuario } from "./definitions/WsCurriculoGetOcorrenciaCvPorUsuario";
import { WsCurriculoGetOcorrenciaCvPorUsuarioResponse } from "./definitions/WsCurriculoGetOcorrenciaCvPorUsuarioResponse";
import { WsCurriculo } from "./services/WsCurriculo";

export interface WsCurriculoClient extends SoapClient {
    WsCurriculo: WsCurriculo;
    getCurriculoCompactadoAsync(wsCurriculoGetCurriculoCompactado: WsCurriculoGetCurriculoCompactado, options?: ISoapExOptions): Promise<[result: WsCurriculoGetCurriculoCompactadoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getCurriculoCompactadoPorUsuarioAsync(wsCurriculoGetCurriculoCompactadoPorUsuario: WsCurriculoGetCurriculoCompactadoPorUsuario, options?: ISoapExOptions): Promise<[result: WsCurriculoGetCurriculoCompactadoPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getDataAtualizacaoCVAsync(wsCurriculoGetDataAtualizacaoCv: WsCurriculoGetDataAtualizacaoCv, options?: ISoapExOptions): Promise<[result: WsCurriculoGetDataAtualizacaoCvResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getDataAtualizacaoCVPorUsuarioAsync(wsCurriculoGetDataAtualizacaoCvPorUsuario: WsCurriculoGetDataAtualizacaoCvPorUsuario, options?: ISoapExOptions): Promise<[result: WsCurriculoGetDataAtualizacaoCvPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getIdentificadorCNPqAsync(wsCurriculoGetIdentificadorCnPq: WsCurriculoGetIdentificadorCnPq, options?: ISoapExOptions): Promise<[result: WsCurriculoGetIdentificadorCnPqResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getIdentificadorCNPqPorUsuarioAsync(wsCurriculoGetIdentificadorCnPqPorUsuario: WsCurriculoGetIdentificadorCnPqPorUsuario, options?: ISoapExOptions): Promise<[result: WsCurriculoGetIdentificadorCnPqPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getOcorrenciaCVAsync(wsCurriculoGetOcorrenciaCv: WsCurriculoGetOcorrenciaCv, options?: ISoapExOptions): Promise<[result: WsCurriculoGetOcorrenciaCvResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getOcorrenciaCVPorUsuarioAsync(wsCurriculoGetOcorrenciaCvPorUsuario: WsCurriculoGetOcorrenciaCvPorUsuario, options?: ISoapExOptions): Promise<[result: WsCurriculoGetOcorrenciaCvPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create WsCurriculoClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<WsCurriculoClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
