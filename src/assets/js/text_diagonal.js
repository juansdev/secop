$(function () {
    var arr = $('.holder').text().split(' ');
    var result = '<span class="rotate"> ' +
        arr.join(' </span><span class="rotate">') +
        '</span>';
    // $('.holder').html(result);
});