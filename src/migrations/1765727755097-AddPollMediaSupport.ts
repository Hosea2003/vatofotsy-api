import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPollMediaSupport1765727755097 implements MigrationInterface {
    name = 'AddPollMediaSupport1765727755097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."poll_choice_media_mediatype_enum" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT')`);
        await queryRunner.query(`CREATE TABLE "poll_choice_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pollChoiceId" uuid NOT NULL, "fileName" character varying NOT NULL, "originalName" character varying NOT NULL, "url" character varying NOT NULL, "mediaType" "public"."poll_choice_media_mediatype_enum" NOT NULL, "mimeType" character varying NOT NULL, "size" bigint NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a8b23179e8a99e16b735c387e45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "polls" ADD "mainImageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "polls" ADD "mainImageFileName" character varying`);
        await queryRunner.query(`ALTER TABLE "poll_choice_media" ADD CONSTRAINT "FK_1b0cb2e6f9ba50b0b1faf871544" FOREIGN KEY ("pollChoiceId") REFERENCES "poll_choices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "poll_choice_media" DROP CONSTRAINT "FK_1b0cb2e6f9ba50b0b1faf871544"`);
        await queryRunner.query(`ALTER TABLE "polls" DROP COLUMN "mainImageFileName"`);
        await queryRunner.query(`ALTER TABLE "polls" DROP COLUMN "mainImageUrl"`);
        await queryRunner.query(`DROP TABLE "poll_choice_media"`);
        await queryRunner.query(`DROP TYPE "public"."poll_choice_media_mediatype_enum"`);
    }

}
