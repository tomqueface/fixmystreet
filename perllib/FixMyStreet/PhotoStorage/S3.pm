package FixMyStreet::PhotoStorage::S3;

use Moose;
use parent 'FixMyStreet::PhotoStorage';

use Net::Amazon::S3;


has client => (
    is => 'ro',
    lazy => 1,
    default => sub {
        my $key = FixMyStreet->config('PHOTOS_S3_ACCESS_KEY');
        my $secret = FixMyStreet->config('PHOTOS_S3_SECRET_KEY');

        my $s3 = Net::Amazon::S3->new(
            aws_access_key_id     => $key,
            aws_secret_access_key => $secret,
            retry                 => 1,
        );
        return Net::Amazon::S3::Client->new( s3 => $s3 );
    },
);

has bucket => (
    is => 'ro',
    lazy => 1,
    default => sub {
        shift->client->bucket( name => FixMyStreet->config('PHOTOS_S3_BUCKET') );
    },
);

sub get_object {
    my ($self, $key) = @_;
    return $self->bucket->object( key => $key );
}

sub store_photo {
    my ($self, $photo_blob) = @_;

    my $type = $self->detect_type($photo_blob) || 'jpeg';
    my $fileid = $self->get_fileid($photo_blob);
    my $key = "$fileid.$type";

    my $object = $self->get_object($key);
    $object->put($photo_blob);

    return $key;
}


sub retrieve_photo {
    my ($self, $key) = @_;

    my $object = $self->get_object($key);
    if ($object->exists) {
        my ($fileid, $type) = split /\./, $key;
        return ($object->get, $type);
    }

}

sub photo_exists {
    my ($self, $key) = @_;

    return $self->get_object($key)->exists;
}

sub tidy_key { $_[1] }


1;
