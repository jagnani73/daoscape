import type { CreateProposalBody } from "../microservices/proposal/proposal.schema";
import {
    CreateBucketCommand,
    HeadBucketCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

export class AkaveService {
    private static instance: AkaveService;
    private static s3Client: S3Client;
    private static bucketName = "eth-prague-proposal-storage";

    public static init = async (): Promise<void> => {
        if (
            !process.env.AKAVE_KEY_ID ||
            !process.env.AKAVE_SECRET_KEY ||
            !process.env.AKAVE_BASE_URL
        ) {
            console.error("Missing Akave env variables.");
            process.exit(1);
        } else {
            this.s3Client = new S3Client({
                endpoint: process.env.AKAVE_BASE_URL,
                region: "us-east-1",
                credentials: {
                    accessKeyId: process.env.AKAVE_KEY_ID,
                    secretAccessKey: process.env.AKAVE_SECRET_KEY,
                },
                forcePathStyle: true,
            });

            try {
                await this.createBucketIfNotExists();
                console.info("Akave Service initiated successfully!");
            } catch (error) {
                console.warn(
                    "Akave Service initialization failed, but continuing anyway:",
                    error
                );
                console.info(
                    "Storage operations may fail until Akave is available."
                );
            }
        }
    };

    private static async createBucketIfNotExists(): Promise<void> {
        try {
            await this.s3Client.send(
                new HeadBucketCommand({ Bucket: this.bucketName })
            );
            console.info(`Bucket '${this.bucketName}' already exists`);
        } catch (error: any) {
            if (
                error.name === "NotFound" ||
                error.$metadata?.httpStatusCode === 404
            ) {
                try {
                    await this.s3Client.send(
                        new CreateBucketCommand({ Bucket: this.bucketName })
                    );
                    console.info(
                        `Bucket '${this.bucketName}' created successfully`
                    );
                } catch (createError) {
                    console.error(
                        `Failed to create bucket '${this.bucketName}':`,
                        createError
                    );
                    throw createError;
                }
            } else {
                console.error(
                    `Error checking bucket '${this.bucketName}':`,
                    error
                );
                throw error;
            }
        }
    }

    public static getInstance(): AkaveService {
        if (!AkaveService.instance) {
            AkaveService.instance = new AkaveService();
        }
        return AkaveService.instance;
    }

    public storeProposal(proposalId: string, proposalData: CreateProposalBody) {
        try {
            const fileName = `proposal::${proposalId}.json`;
            const command = new PutObjectCommand({
                Bucket: AkaveService.bucketName,
                Key: fileName,
                Body: JSON.stringify(proposalData, null, 2),
                ContentType: "application/json",
                ACL: "public-read",
            });

            // * INFO: fire and forget
            AkaveService.s3Client.send(command);

            const assetUrl = `${process.env.AKAVE_BASE_URL}/${AkaveService.bucketName}/${fileName}`;

            console.info(
                `Proposal ${proposalId} stored successfully in Akave O3 at: ${assetUrl}`
            );

            return assetUrl;
        } catch (error) {
            console.error(
                `Failed to store proposal ${proposalId} in Akave O3:`,
                error
            );
            return null;
        }
    }
}
