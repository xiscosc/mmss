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

    public async getValueFromMatrixByDimensions(pricingType: PricingFile, height: number, width: number, fileId = "default"): Promise<number> {
        const fileKey = `${pricingType}/matrix_${fileId}.csv`
        const dimension = PricingProvider.getDimensionKey(Math.floor(height), Math.floor(width))
        
        const params: SelectObjectContentCommandInput = {
            Bucket: env.matrixBucket,
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
            Bucket: env.matrixBucket,
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

    private static getDimensionKey(height: number, width: number): string {
        const max = Math.max(height, width)
        const min = Math.min(height, width)
        return `${min}x${max}`
    }
}