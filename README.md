# ts-datepicker
一个自定义日期控件，可以方便选择年、年月、年月日，包含开始日期、结束日期双日期控件

名称：下拉日期控件
版本：v0.1
日期：2015.9.20
作者：lordrobert
功能：提供在年、年月、年月日之间灵活选择的日期控件
用法：引入jquery, ts-datepicker.js,ts-datepicker.css
示例：
html:
<div class="ts-datepicker-group" onselectstart="return false;">
    <span>起始日期：</span> <input type="text" data-id="startdate" class="ts-datepicker" />
    <span>结束日期：</span> <input type="text" data-id="enddate" class="ts-datepicker" />
    <label>区间模式</label><input type="checkbox" checked />
</div>
script:
$(".ts-datepicker-group").tsdatepickergroup({min:'2014-2-1',max:'2014-5-14'});


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

add by lordrobert 20160606