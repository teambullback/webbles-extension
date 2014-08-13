(function() {
	// insert font-awesome.min.css
	$('head').append("<link href=\"//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css\" rel=\"stylesheet\">");

	var attr, css, cls;

	attr = {
		'id': 'ycs-status',
	}

	css = {
		'display': 'none',
	}

	cls = [
		'ycs',
	]

	var status = putDom('html', 'div', attr, css, cls);

	attr = {
		'id': 'ycs-wrapper',
	};

	css = {
		'position': 'fixed',
	    'top': '0',
	    'left': '0',
	    'width': '100%',
	    'height': '100px',
	    'z-index': '10000',
	};

	cls = [
		'ycs',
	];

	var wrapper = putDom('body', 'div', attr, css, cls);

	var content = [
	    "<div class=\"alert alert-info alert-dismissible\" role=\"alert\" style=\"height:50px;\">",
		"  <button type=\"button\" class=\"close\" data-dismiss=\"alert\">",
		"    <span aria-hidden=\"true\">&times;</span>",
		"    <span class=\"sr-only\">Close</span>",
		"  </button>",
		"  <p class=\"pull-left\" style=\"margin-top: 1px;\"><strong>사이트 레이아웃을 원하는 모습으로 바꿔보세요.</strong> 이미 <strong>1</strong>개의 사이트 레이아웃이 제작되어 있습니다.</p>",
		"  <p class=\"pull-right\" style=\"margin-top: 1px;\"><i class=\"fa fa-search\"></i> 레이아웃 찾아보기&nbsp;&nbsp;</p>",
		"  <p class=\"pull-right\" style=\"margin-top: 1px;\"><i class=\"fa fa-file-text-o\"></i> 레이아웃 제작하기&nbsp;&nbsp;</p>",
	    "</div>",
	].join('\n');

	attr = {
		'id': 'ycs-handler',
	};

	css = {
		'position': 'absolute',
	    'top': '0',
	    'left': '0',
	    'width': '0',
	    'height': '0',
	    'z-index': '10000',
	};

	cls = [
		'ycs',
	];

	wrapper.append(content);

	var handler = putDom('body', 'div', attr, css, cls)

	var content = [
		"<div class=\"modal fade\" id=\"handler\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"handler\" aria-hidden=\"true\">",
		"  <div class=\"modal-dialog modal-sm\">",
		"    <div class=\"modal-content\">",
		"      <div class=\"modal-header\">",
		"        <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>",
		"        <h4 class=\"modal-title\" id=\"handlerLabel\">효과 적용</h4>",
		"      </div>",
		"      <div class=\"modal-footer\">",
		"        <button id=\"locate\" type=\"button\" class=\"btn btn-info\">",
		"          <i class=\"fa fa-arrows\"></i>&nbsp;이동",
		"        </button>",
		"        <button id=\"delete\" type=\"button\" class=\"btn btn-info\">",
		"          <i class=\"fa fa-trash-o\"></i>&nbsp;삭제",
		"        </button>",
		"        <button id=\"cancel\" type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">",
		"          <i class=\"fa fa-check\"></i>&nbsp;적용",
		"        </button>",
		"      </div>",
		"    </div>",
		"  </div>",
		"</div>",
	].join('\n');

	handler.append(content);
	
	attr = {

	};

	css = {
		'top': '50px',
	}

	setDom('body', attr, css);
})();