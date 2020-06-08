import './styles/about.less';
import $ from 'jquery';

$('.box').click(() => {
  $('.box').text() ? $('.box').text('') : $('.box').text('Hello,About');
});