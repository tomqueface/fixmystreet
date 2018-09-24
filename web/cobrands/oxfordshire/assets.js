(function(){
  function disable_form(disable) {
    $('#post_category_details_form').toggle(!disable);
    $('#private_form').toggle(!disable);
  }

  function check_rights_of_way() {
    if (OpenLayers.Util.indexOf(fixmystreet.bodies, 'Oxfordshire County Council') > -1 && $('#form_category').val() == 'Countryside Paths / Public Rights of Way (usually not tarmac)') {
        $('#category_meta').html('<p>Please report problems with rights of way at <a href="https://publicrightsofway.oxfordshire.gov.uk/web/standardmap.aspx">https://publicrightsofway.oxfordshire.gov.uk/web/standardmap.aspx</a></p>');
        disable_form(true);
    } else {
        $('#category_meta').html('');
        disable_form(false);
    }
  }

  $(fixmystreet).on('report_new:category_change', check_rights_of_way);
})();
