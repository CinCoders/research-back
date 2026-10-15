import { WsCurriculoGetCurriculoCompactado } from "../definitions/WsCurriculoGetCurriculoCompactado";
import { WsCurriculoGetCurriculoCompactadoResponse } from "../definitions/WsCurriculoGetCurriculoCompactadoResponse";
import { WsCurriculoGetCurriculoCompactadoPorUsuario } from "../definitions/WsCurriculoGetCurriculoCompactadoPorUsuario";
import { WsCurriculoGetCurriculoCompactadoPorUsuarioResponse } from "../definitions/WsCurriculoGetCurriculoCompactadoPorUsuarioResponse";
import { WsCurriculoGetDataAtualizacaoCv } from "../definitions/WsCurriculoGetDataAtualizacaoCv";
import { WsCurriculoGetDataAtualizacaoCvResponse } from "../definitions/WsCurriculoGetDataAtualizacaoCvResponse";
import { WsCurriculoGetDataAtualizacaoCvPorUsuario } from "../definitions/WsCurriculoGetDataAtualizacaoCvPorUsuario";
import { WsCurriculoGetDataAtualizacaoCvPorUsuarioResponse } from "../definitions/WsCurriculoGetDataAtualizacaoCvPorUsuarioResponse";
import { WsCurriculoGetIdentificadorCnPq } from "../definitions/WsCurriculoGetIdentificadorCnPq";
import { WsCurriculoGetIdentificadorCnPqResponse } from "../definitions/WsCurriculoGetIdentificadorCnPqResponse";
import { WsCurriculoGetIdentificadorCnPqPorUsuario } from "../definitions/WsCurriculoGetIdentificadorCnPqPorUsuario";
import { WsCurriculoGetIdentificadorCnPqPorUsuarioResponse } from "../definitions/WsCurriculoGetIdentificadorCnPqPorUsuarioResponse";
import { WsCurriculoGetOcorrenciaCv } from "../definitions/WsCurriculoGetOcorrenciaCv";
import { WsCurriculoGetOcorrenciaCvResponse } from "../definitions/WsCurriculoGetOcorrenciaCvResponse";
import { WsCurriculoGetOcorrenciaCvPorUsuario } from "../definitions/WsCurriculoGetOcorrenciaCvPorUsuario";
import { WsCurriculoGetOcorrenciaCvPorUsuarioResponse } from "../definitions/WsCurriculoGetOcorrenciaCvPorUsuarioResponse";

export interface WsCurriculoPort {
    getCurriculoCompactado(wsCurriculoGetCurriculoCompactado: WsCurriculoGetCurriculoCompactado, callback: (err: any, result: WsCurriculoGetCurriculoCompactadoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getCurriculoCompactadoPorUsuario(wsCurriculoGetCurriculoCompactadoPorUsuario: WsCurriculoGetCurriculoCompactadoPorUsuario, callback: (err: any, result: WsCurriculoGetCurriculoCompactadoPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getDataAtualizacaoCV(wsCurriculoGetDataAtualizacaoCv: WsCurriculoGetDataAtualizacaoCv, callback: (err: any, result: WsCurriculoGetDataAtualizacaoCvResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getDataAtualizacaoCVPorUsuario(wsCurriculoGetDataAtualizacaoCvPorUsuario: WsCurriculoGetDataAtualizacaoCvPorUsuario, callback: (err: any, result: WsCurriculoGetDataAtualizacaoCvPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getIdentificadorCNPq(wsCurriculoGetIdentificadorCnPq: WsCurriculoGetIdentificadorCnPq, callback: (err: any, result: WsCurriculoGetIdentificadorCnPqResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getIdentificadorCNPqPorUsuario(wsCurriculoGetIdentificadorCnPqPorUsuario: WsCurriculoGetIdentificadorCnPqPorUsuario, callback: (err: any, result: WsCurriculoGetIdentificadorCnPqPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getOcorrenciaCV(wsCurriculoGetOcorrenciaCv: WsCurriculoGetOcorrenciaCv, callback: (err: any, result: WsCurriculoGetOcorrenciaCvResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getOcorrenciaCVPorUsuario(wsCurriculoGetOcorrenciaCvPorUsuario: WsCurriculoGetOcorrenciaCvPorUsuario, callback: (err: any, result: WsCurriculoGetOcorrenciaCvPorUsuarioResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
