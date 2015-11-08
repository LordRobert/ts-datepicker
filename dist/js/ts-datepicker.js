/*
名称：下拉日期控件
版本：v0.1
日期：2014.8.20
作者：zhaosl
功能：提供在年、年月、年月日之间灵活选择的日期控件
用法：引入jquery, ts-datepicker.js,ts-datepicker.css，最简用法：文本框元素设置ts-datepicker样式类即可
示例：<input type="text" class="ts-datepicker" ts-dp-option="{min:'2014-2-1',max:'2015-2-14'}"/>

参数说明：
1，split，
	表示分隔符，即yyyy-MM-dd中的-。如果指定了split，则min/max中分隔符也需要使用此split
	可选设置，默认是-。

2，max/min
	表示最大最小日期，必须是完整的年月日形式，如：2015-5-5，
	可选设置，默认min是2015-1-1，max是当日三年后年份的最后一天；配置错误，会导致退出，在console中有原因提示；

3，type，表示类型，yMd代表年月日，可配置y表示只有年，yM表示年月，yMd表示年月日。
	可选设置，默认是yMd。配置错误也是此值

注意事项：
1，此控件依赖于jquery，请在引入此文件前引入jquery，支持jquery1.3.1+，更低版本未做测试
2，如果指定了split，则min/max中分隔符也需要使用此split
2，min/max配置错误会导致退出：错误原因主要有：配置格式错误、最小日期大于最大日期等
*/

;(function($){

	var show;

	var methods = {

		init: function(options) {

			var defaults = {
				split: '-',
				type: 'yMd',
				max: getTSDate(),
				min: getTSDate('2010-1-1')
			};

			//针对传递进来的日期，转变为日期对象
			if (options.max && !(options.max instanceof Date)) {
				options.max = getTSDate(options.max);
			};
			if (options.min && !(options.min instanceof Date)) {
				options.min = getTSDate(options.min);
			};

			//参数覆盖
			var opt = $.extend({}, defaults, options);

			//获取配置参数
			var spt = opt.split || "-";
			var dtmax = opt.max;
			var dtmin = opt.min;
			var type = opt.type;
			if (type != "yM" && type != "y" ) {type="yMd"};

			//检查参数配置情况等
			if ( !dtmin || !dtmin instanceof  Date ) {
				console.error("最小日期配置错误，需要为日期格式。");
				return;
			}

			if ( !dtmax || !dtmax instanceof  Date ) {
				console.error("最大日期配置错误，需要为日期格式。");
				return;
			}

			if (dtmin > dtmax) {
				console.error("配置错误，最小日期大于最大日期！");
				return;
			};

			//参数提取
			// var y_start = min.getFullYear();
			// var m_start = min.getMonth();
			// var d_start = min.getDay();

			// var y_end = max.getFullYear();
			// var m_end = max.getMonth();
			// var d_end = max.getDay();

			this.each(function (){
				var $this = $(this);
				//绑定函数
				$('.ts-datepicker', $this).click(function(e){

					//清除上一个弹出的日期面板
					$('.ts-dp-panel').remove();

					var max = dtmax;
					var min = dtmin;
				
					//当前日期框
					$target = $(this);
					if ($target.hasClass("disabled")) {return;};


					var target_height = $target.innerHeight() + 2;
					//当前是否是开始日期
					var isStartDate = $(".ts-datepicker", $this).get(0) == this ? true : false;
					
					//如果是开始日期 且 结束日期不为空，则加入结束日期进行判断 else 则对开始日期进行判断
					if (isStartDate && $(".ts-datepicker", $target.parent()).get(1).value) {
						var str_max = $(".ts-datepicker", $target.parent()).get(1).value;
						str_max = str_max.length == 10 ? str_max : str_max.length  > 4 ? str_max + "-" + getMaxDay(str_max.split('-')[0],str_max.split('-')[1]) : str_max + "-12-" +  getMaxDay(str_max, 12);
						var tmp_max = getTSDate( str_max );
						if (max > tmp_max) {
							max = tmp_max;
						};
					}else{
						var str_min = $(".ts-datepicker", $target.parent()).get(0).value;
						str_min = str_min.length == 10 ? str_min : str_min.length  > 4 ? str_min + "-01" : str_min + "-01-01" ;
						var tmp_min = getTSDate( str_min );
						if (min < tmp_min) {
							min = tmp_min;
						};
					}


					var y_start = min.getFullYear();
					var m_start = min.getMonth();
					var d_start = min.getDay();

					var y_end = max.getFullYear();
					var m_end = max.getMonth();
					var d_end = max.getDay();


					//容器
					var div_container = $("<dvi></div>"); 
					div_container.addClass("ts-dp-panel");
					div_container.css("left", $target.offset().left);
					div_container.css("top", $target.offset().top + target_height);

					//年（默认选中最小年份）
					var sl_year = $('<select></select>');
					sl_year.addClass("ts-dp-y");
					for (var i = y_start; i <= y_end; i++) {
						sl_year.append("<option value='"+i+"'>"+i+"</option>");
					};
					div_container.append(sl_year);

					//月
					if (type.indexOf("M") > -1) {
						//月（默认选中可选的最小月份，都可选则选中“--”）
						var sl_month = $('<select></select>');
						sl_month.addClass("ts-dp-m");

						//配置的最大最小日期包含当前年，则月份添加--
						generateMonth(min, max, sl_year.val(), sl_month, m_start, m_end);
						div_container.append(sl_month);
					};


					if (type.indexOf("d") > -1) {
						//日（默认选中可选的最小日，都可选则选中“--”）
						var sl_day = $('<select></select>');
						sl_day.addClass("ts-dp-d");

						//配置的最大最小日期包含当前月，则日下拉中添加--
						generateDay(min, max, sl_year.val(), sl_month.val(), sl_day, d_start, d_end);
						div_container.append(sl_day);
					};


					//确定按钮
					var html_func =	" <div class=\"ts-dp-btngp\">" + 
								    "    <button class=\"ts-dp-btn-ok\">确定</button> " + 
								    "    <button class=\"ts-dp-btn-cancel\">取消</button>" + 
								    " </div>" ;
					div_container.append($(html_func));


					//显示
					$('body').append(div_container);


					//添加事件
					$('.ts-dp-btn-ok').click(function(e){
						//获取当前元素的位置
						var year = $('.ts-dp-y').val();
						var month = $('.ts-dp-m').val();
						var day = $('.ts-dp-d').val();


						if (type.indexOf("M")<0) {
							$target.val(year);
						}else if (type.indexOf("d")<0) {
							if (month == "--") {
								$target.val(year);
							}else{
								$target.val(year + spt + month);
							}
						}else {
							if (month == "--") {
								$target.val(year);
							}else if(day == "--"){
								$target.val(year + spt + month);
							}else{
								$target.val(year + spt + month + spt + day);
							}
						}

						$('.ts-dp-panel').remove();
			            $target.trigger("change");
					});

					$('.ts-dp-btn-cancel').click(function(e){
						$('.ts-dp-panel').remove();
					});

					$('.ts-dp-panel').click(function(e){
						show = true;
					});

					show = true;

					//年份联动事件
					sl_year.change( function(){
						//重新生成
						if (type.indexOf("M")<0) {return;};
						sl_month.empty();
						generateMonth(min, max, sl_year.val(), sl_month);
						if (type.indexOf("d")<0) {return;};
						sl_day.empty();
						generateDay(min, max, sl_year.val(), sl_month.val(), sl_day);

					});

					//月份联动事件
					if (type.indexOf("d")>0) {
						sl_month.change( function(){

							//重新生成
							if (type.indexOf("d")<0) {return;};
							sl_day.empty();
							generateDay(min, max, sl_year.val(), sl_month.val(), sl_day, d_start, d_end);

						});
					};

				});


				//区间模式事件——区间模式，有结束日期
				//非区间模式，没有结束日期
				$('input[type=checkbox]', $this).click(function(e){
					if (this.checked) {
						openPeriodModel($this);
					}else{
						closePeriodModel($this);
					}
				});
			});


			return this;
		}
		//获取起始日期
		,getStartDate: function (){
			return $('.ts-datepicker',this).eq(0).val();
		}
		//获取结束日期
		,getEndDate: function (){
			return $('.ts-datepicker',this).eq(1).val();
		}
		//当前状态
		,getState: function (){
			return $('input[type=checkbox]',this).prop("checked") === true ? 2: 1;
		}

	};



	//日期函数
	$.fn.tsdatepickergroup = function (method){

		var $container;
		var $target;


		// 方法调用
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + 'does not exist on jQuery.tooltip');
        }
	}


    //切换区间模式和非区间模式
	$(document).click(function(e){
		//获取当前元素的位置
		//alert(0);
		if ($('.ts-dp-panel') && !show) {
			$('.ts-dp-panel').remove();
		}
		show = false;
	});


	/*-------工具函数开始-----------*/
	//设置区间模式
	function openPeriodModel($container){
		$('input[data-id=enddate]', $container).removeClass("disabled");
		$('input[data-id=enddate]', $container).attr("disabled", false);
	}

	//设置区间模式
	function closePeriodModel($container){
		$('input[data-id=enddate]', $container).addClass("disabled");
		$('input[data-id=enddate]', $container).attr("disabled", true);
	}

	//2015,5 表示2015年5月
	function getMaxDay (year, month) {
		// body...
		var leapYear = false;
		year  = parseInt(year);
		month  = parseInt(month);

		if ( (year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
			leapYear = true;
		};

		if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12 ) {
			return 31;
		}else if(month == 4 || month == 6 || month == 9 || month == 11){
			return 30;
		}else if(leapYear){
			return 29;
		}else{
			return 28;
		}
	}

	//生成月份
	function generateMonth(date_min, date_max, current_year, ele_month){
		var m_start_tmp = 1;//起始月
		var m_end_tmp = 12;//结束月
		//var current_year_first_day = new Date( current_year, 0, 1);
		if ( date_min <= new Date( current_year, 0, 1) && date_max >= new Date( current_year, 11, getMaxDay(current_year, 12) ) ) {
			ele_month.append("<option value='--'>--</option>");
		}

		if ( date_min.getFullYear() == parseInt( current_year ) ) {
			m_start_tmp = date_min.getMonth() + 1;
		}

		if (date_max.getFullYear() == parseInt( current_year )) {
			m_end_tmp = date_max.getMonth() + 1;
		}

		for (var i = m_start_tmp; i <= m_end_tmp; i++) {
			var m_v = ("0"+i);
			m_v = m_v.substr(m_v.length-2);
			ele_month.append("<option value='"+m_v+"'>"+m_v+"</option>");
		}
	}

	//生成日期
	function generateDay(date_min, date_max, current_year, current_month, ele_day){
		if (current_month == "--") {
			ele_day.append("<option value='--'>--</option>");
			return;
		};

		var d_start_tmp = 1;
		var d_end_tmp = getMaxDay(current_year, current_month);
		if ( ( date_min - new Date(current_year, parseInt(current_month) - 1, 1 ) <= 0 ) && (date_max - new Date( current_year, parseInt(current_month) - 1, getMaxDay(current_year, parseInt(current_month) )) >= 0)) {
			ele_day.append("<option value='--'>--</option>");
			
		}
		if ( date_min.getFullYear() == parseInt(current_year) && date_min.getMonth() == parseInt(current_month)-1 ) {date_max - new Date( current_year, parseInt(current_month) - 1, getMaxDay(current_year, parseInt(current_month) - 1)) >= 0
			d_start_tmp = date_min.getDate();
		}
		if ( date_max.getFullYear() == parseInt(current_year) && date_max.getMonth() == parseInt(current_month)-1 ) {
			d_end_tmp = date_max.getDate();
		}


		for (var i = d_start_tmp; i <= d_end_tmp; i++) {
			var d_v = ("0"+i);
			d_v = d_v.substr(d_v.length-2);
			ele_day.append("<option value='"+d_v+"'>"+d_v+"</option>");
		}
	}


	//获取日期
	//空——今天
	//解决new Date('2015-02-02')是2015-02-02 08:00:00的bug
	//new Date('2015-2-2')是2015-02-02 00:00:00
	function getTSDate(s_date){

		var date;
		if(!s_date){
			date = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDay());
		}

		if (typeof(s_date) ==  "string" && s_date.length > 7) {
			date = new Date( s_date.replace(/-0/g, "-").replace(/\/0/g, "\/") );
		};

		return date;

	}
	/*-------工具函数结束-----------*/

})(jQuery);
