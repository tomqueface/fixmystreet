#!/usr/bin/env perl
use FixMyStreet::Test;

use Test::MockModule;
use Path::Tiny 'path';

use_ok( 'FixMyStreet::PhotoStorage::S3' );

FixMyStreet::override_config {
    PHOTO_STORAGE_OPTIONS => {
        ACCESS_KEY => 'AKIAMYFAKEACCESSKEY',
        SECRET_KEY => '1234/fAk35eCrETkEy',
        BUCKET => 'fms-test-photos',
        PREFIX => '/uploads',
    },
}, sub {

    my $s3 = FixMyStreet::PhotoStorage::S3->new();

    subtest "basic attributes are configured correctly" => sub {
        ok $s3->client, "N::A::S3::Client created";
        is $s3->client->s3->aws_access_key_id, 'AKIAMYFAKEACCESSKEY', "Correct access key used";
        is $s3->client->s3->aws_secret_access_key, '1234/fAk35eCrETkEy', "Correct secret key used";

        ok $s3->bucket, "N::A::S3::Bucket created";
        is $s3->bucket->name, 'fms-test-photos', "Correct bucket name configured";

        is $s3->prefix, '/uploads/', "Correct key prefix with trailing slash";
    };

    subtest "photos can be stored in S3" => sub {
        my $photo_blob = path('t/app/controller/sample.jpg')->slurp;
        is $s3->get_fileid($photo_blob), '74e3362283b6ef0c48686fb0e161da4043bbcc97', "File ID calculated correctly";
        is $s3->detect_type($photo_blob), 'jpeg', "File type calculated correctly";

        my $s3_object = Test::MockModule->new('Net::Amazon::S3::Client::Object');
        $s3_object->mock('put', sub {
            my ($self, $photo) = @_;
            is $self->key, '/uploads/74e3362283b6ef0c48686fb0e161da4043bbcc97.jpeg', 'Object created with correct key';
            is $self->bucket->name, 'fms-test-photos', 'Object stored in correct bucket';
            is $photo, $photo_blob, 'Correct photo uploaded';
        });

        is $s3->store_photo($photo_blob), '/uploads/74e3362283b6ef0c48686fb0e161da4043bbcc97.jpeg', 'Photo uploaded and correct key returned';
    };

    # photos can be stored
    # photos can be fetched


    # prefix is set properly

};

done_testing();
