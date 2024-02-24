import { S3, SelectObjectContentCommandInput, SelectObjectContentCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

export enum PricingFile {
    MOLDS = 'molds',
    GLASS = 'glass',
    BACK = 'back',
    PP = 'pp',
}

export class PricingProvider {

    constructor(private s3Client: S3 = new S3()) {}

    public async getValueFromMatrixByDimensions(pricingType: PricingFile, d1: number, d2: number, fileId = "default"): Promise<number> {
        const fileKey = `${pricingType}/matrix_${fileId}.csv`
        const dimension = PricingProvider.getDimensionKey(Math.floor(d1), Math.floor(d2))
        
        const params: SelectObjectContentCommandInput = {
            Bucket: env.pricingBucket,
            Key: fileKey,
            ExpressionType: 'SQL',
            Expression: `SELECT price FROM S3Object WHERE dimension=${dimension}`,
            InputSerialization: {
                CSV: {
                    FileHeaderInfo: 'USE',
                    RecordDelimiter: '\n',
                    FieldDelimiter: ','
                }
            },
            OutputSerialization: {
                JSON: {}
            }
        };

        await this.s3Client.send(new SelectObjectContentCommand(params))
        return 0
    }

    public async getValueFromListById(pricingType: PricingFile, id: string, fileId = "default"): Promise<number> {
        const fileKey = `${pricingType}/list_${fileId}.csv`        
        const params: SelectObjectContentCommandInput = {
            Bucket: env.pricingBucket,
            Key: fileKey,
            ExpressionType: 'SQL',
            Expression: `SELECT price FROM S3Object WHERE id=${id}`,
            InputSerialization: {
                CSV: {
                    FileHeaderInfo: 'USE',
                    RecordDelimiter: '\n',
                    FieldDelimiter: ','
                }
            },
            OutputSerialization: {
                JSON: {}
            }
        };

        await this.s3Client.send(new SelectObjectContentCommand(params))
        return 0
    }

    public async getAreaValueFromList(pricingType: PricingFile, d1: number, d2: number, fileId: string): Promise<number> {
        const {d1o , d2o} = PricingProvider.getOrderedDimensions(Math.floor(d1), Math.floor(d2))
        const fileKey = `${pricingType}/area_${fileId}.csv`
        
        const params: SelectObjectContentCommandInput = {
            Bucket: env.pricingBucket,
            Key: fileKey,
            ExpressionType: 'SQL',
            Expression: `SELECT price FROM S3Object WHERE d1 >= ${d1o} and d2 >= ${d2o} ORDER BY d1 * d2 LIMIT 1`,
            InputSerialization: {
                CSV: {
                    FileHeaderInfo: 'USE',
                    RecordDelimiter: '\n',
                    FieldDelimiter: ','
                }
            },
            OutputSerialization: {
                JSON: {}
            }
        };

        await this.s3Client.send(new SelectObjectContentCommand(params))
        return 0
    }

    private static getDimensionKey(height: number, width: number): string {
        const max = Math.max(height, width)
        const min = Math.min(height, width)
        return `${min}x${max}`
    }

    private static getOrderedDimensions(height: number, width: number) {
        return { d1o: Math.max(height, width), d2o: Math.min(height, width)}
    }
}