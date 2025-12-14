import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePollTable1765725775521 implements MigrationInterface {
    name = 'CreatePollTable1765725775521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "poll_votes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pollId" uuid NOT NULL, "choiceId" uuid NOT NULL, "userId" uuid NOT NULL, "votedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f61440ab2e3c9567d32697f3120" UNIQUE ("pollId", "userId", "choiceId"), CONSTRAINT "PK_b94b2749fdb5f5dd3836b8f907a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."poll_choices_mediatype_enum" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT')`);
        await queryRunner.query(`CREATE TABLE "poll_choices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pollId" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying, "mediaUrl" character varying, "mediaType" "public"."poll_choices_mediatype_enum", "mediaFileName" character varying, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_307c87ec38ce81aa0366da004b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."polls_type_enum" AS ENUM('PUBLIC', 'PRIVATE')`);
        await queryRunner.query(`CREATE TYPE "public"."polls_resultdisplaytype_enum" AS ENUM('OPEN', 'CLOSED')`);
        await queryRunner.query(`CREATE TYPE "public"."polls_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'ENDED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "polls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "createdBy" uuid NOT NULL, "organizationId" uuid, "type" "public"."polls_type_enum" NOT NULL DEFAULT 'PUBLIC', "resultDisplayType" "public"."polls_resultdisplaytype_enum" NOT NULL DEFAULT 'CLOSED', "status" "public"."polls_status_enum" NOT NULL DEFAULT 'DRAFT', "votingEndsAt" TIMESTAMP NOT NULL, "allowMultipleChoices" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b9bbb8fc7b142553c518ddffbb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "poll_votes" ADD CONSTRAINT "FK_126dde5dfb2f0bafcd65ea27dc5" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_votes" ADD CONSTRAINT "FK_0a07f9426abb2011c493183981b" FOREIGN KEY ("choiceId") REFERENCES "poll_choices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_votes" ADD CONSTRAINT "FK_0281387f2c63687277cd175c4f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_choices" ADD CONSTRAINT "FK_4828a678112ffbb57dc26178f7a" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "polls" ADD CONSTRAINT "FK_5c977b318e08ce4926b3ca72a3a" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "polls" ADD CONSTRAINT "FK_14c8f5f26a1b9d6bc5dd984db5e" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "polls" DROP CONSTRAINT "FK_14c8f5f26a1b9d6bc5dd984db5e"`);
        await queryRunner.query(`ALTER TABLE "polls" DROP CONSTRAINT "FK_5c977b318e08ce4926b3ca72a3a"`);
        await queryRunner.query(`ALTER TABLE "poll_choices" DROP CONSTRAINT "FK_4828a678112ffbb57dc26178f7a"`);
        await queryRunner.query(`ALTER TABLE "poll_votes" DROP CONSTRAINT "FK_0281387f2c63687277cd175c4f4"`);
        await queryRunner.query(`ALTER TABLE "poll_votes" DROP CONSTRAINT "FK_0a07f9426abb2011c493183981b"`);
        await queryRunner.query(`ALTER TABLE "poll_votes" DROP CONSTRAINT "FK_126dde5dfb2f0bafcd65ea27dc5"`);
        await queryRunner.query(`DROP TABLE "polls"`);
        await queryRunner.query(`DROP TYPE "public"."polls_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."polls_resultdisplaytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."polls_type_enum"`);
        await queryRunner.query(`DROP TABLE "poll_choices"`);
        await queryRunner.query(`DROP TYPE "public"."poll_choices_mediatype_enum"`);
        await queryRunner.query(`DROP TABLE "poll_votes"`);
    }

}
