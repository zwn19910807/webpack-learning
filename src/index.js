import './styles/index.less';
import $ from 'jquery';

$('#root').click(() => {
  $('#root').text() ? $('#root').text('') : $('#root').text('Hello,Index');
});