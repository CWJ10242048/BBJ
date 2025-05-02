import{k as U,m as $,r as _,$ as E,b as r,ak as q,T as A,o as i,c,d as e,t as l,f as s,w as a,h as m,F as L,e as z,s as v,n as w,g as f,al as G,af as K,a3 as O,am as Q,an as W,ao as X}from"./index-8f7409db.js";import{_ as Y}from"./_plugin-vue_export-helper-c27b6911.js";const Z={class:"problem-detail-container"},ee={key:0,class:"content-wrapper"},te={class:"problem-info"},se={class:"problem-header"},le={class:"problem-title"},ne={class:"problem-tags"},ae={class:"problem-stats"},oe={class:"stat-item"},ue={class:"stat-value"},ie={class:"stat-item"},ce={class:"stat-value"},de={class:"problem-description"},re=["innerHTML"],pe={class:"problem-examples"},ve={class:"example-header"},_e={class:"example-content"},me={class:"example-input"},fe={class:"example-output"},ge={key:0,class:"example-explanation"},be={key:0,class:"problem-constraints"},he=["innerHTML"],ye={class:"code-editor"},xe={class:"editor-header"},ke={class:"language-selector"},Ce={class:"language-option"},we={class:"editor-actions"},Se={class:"code-area"},Ve={class:"code-header"},Le={class:"current-language"},ze={class:"code-tips"},Te={class:"result-header"},De={class:"result-content"},Me={key:0,class:"success-message"},je={key:1,class:"error-message"},Pe={key:2,class:"output-panel"},He={key:3,class:"expected-panel"},Je=U({__name:"ProblemDetail",setup(Ne){const T=$(),h=_(!0);T.params.id;const y=[{label:"Python",value:"python",icon:"🐍"},{label:"Java",value:"java",icon:"☕"},{label:"C++",value:"cpp",icon:"🔍"},{label:"JavaScript",value:"javascript",icon:"🟨"}],p=_("python"),x=_(""),D=_({python:`# 在这里编写你的Python代码

def solution():
    # 实现你的解决方案
    pass
`,java:`// 在这里编写你的Java代码

public class Solution {
    public static void main(String[] args) {
        // 调用你的解决方案
    }
    
    public static void solution() {
        // 实现你的解决方案
    }
}`,cpp:`// 在这里编写你的C++代码

#include <iostream>
using namespace std;

class Solution {
public:
    void solution() {
        // 实现你的解决方案
    }
};

int main() {
    Solution s;
    s.solution();
    return 0;
}`,javascript:`// 在这里编写你的JavaScript代码

function solution() {
    // 实现你的解决方案
}
`}),o=_({show:!1,status:"",message:""}),u=_({id:"1",title:"两数之和",difficulty:"简单",category:"数组",submitCount:1e3,acceptRate:75,description:`<p>给定一个整数数组 <code>nums</code> 和一个整数目标值 <code>target</code>，请你在该数组中找出 <strong>和为目标值</strong> 的那 <strong>两个</strong> 整数，并返回它们的数组下标。</p>
<p>你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。</p>
<p>你可以按任意顺序返回答案。</p>`,examples:[{input:"nums = [2,7,11,15], target = 9",output:"[0,1]",explanation:"因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。"},{input:"nums = [3,2,4], target = 6",output:"[1,2]"},{input:"nums = [3,3], target = 6",output:"[0,1]"}],constraints:`<ul>
<li><code>2 <= nums.length <= 10<sup>4</sup></code></li>
<li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
<li><code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code></li>
<li><strong>只会存在一个有效答案</strong></li>
</ul>`,code:{python:`def twoSum(nums, target):
    # 在这里编写你的代码
    pass`,java:`class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 在这里编写你的代码
        return null;
    }
}`,cpp:`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // 在这里编写你的代码
        return {};
    }
};`,javascript:`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // 在这里编写你的代码
};`}}),M=d=>{switch(d){case"简单":return"success";case"中等":return"warning";case"困难":return"danger";default:return"info"}},k=()=>{var d;x.value=((d=u.value.code)==null?void 0:d[p.value])||D.value[p.value]},j=()=>{o.value={show:!0,status:Math.random()>.3?"success":"error",message:"测试用例 2 失败",output:"[1,3]",expected:"[1,2]"}},P=()=>{o.value={show:!0,status:Math.random()>.3?"success":"error",message:"解答错误",output:"[1,3]",expected:"[1,2]"}},H=()=>{const d=y.find(t=>t.value===p.value);return d?d.icon:""},J=()=>{const d=y.find(t=>t.value===p.value);return d?d.label:""};return E(()=>{setTimeout(()=>{h.value=!1,k()},500)}),(d,t)=>{const S=r("el-tag"),N=r("el-divider"),R=r("el-option"),B=r("el-select"),g=r("el-button"),b=r("el-tooltip"),C=r("el-icon"),F=r("el-input"),I=q("loading");return A((i(),c("div",Z,[h.value?v("",!0):(i(),c("div",ee,[e("div",te,[e("div",se,[e("h2",le,l(u.value.id)+". "+l(u.value.title),1),e("div",ne,[s(S,{type:M(u.value.difficulty),size:"small"},{default:a(()=>[m(l(u.value.difficulty),1)]),_:1},8,["type"]),s(S,{type:"info",size:"small",class:"category-tag"},{default:a(()=>[m(l(u.value.category),1)]),_:1})])]),e("div",ae,[e("div",oe,[t[3]||(t[3]=e("span",{class:"stat-label"},"提交次数:",-1)),e("span",ue,l(u.value.submitCount),1)]),e("div",ie,[t[4]||(t[4]=e("span",{class:"stat-label"},"通过率:",-1)),e("span",ce,l(u.value.acceptRate)+"%",1)])]),s(N),e("div",de,[t[5]||(t[5]=e("h3",null,"题目描述",-1)),e("div",{innerHTML:u.value.description},null,8,re)]),e("div",pe,[t[9]||(t[9]=e("h3",null,"示例",-1)),(i(!0),c(L,null,z(u.value.examples,(n,V)=>(i(),c("div",{key:V,class:"example-item"},[e("div",ve,"示例 "+l(V+1),1),e("div",_e,[e("div",me,[t[6]||(t[6]=e("div",{class:"example-label"},"输入:",-1)),e("pre",null,l(n.input),1)]),e("div",fe,[t[7]||(t[7]=e("div",{class:"example-label"},"输出:",-1)),e("pre",null,l(n.output),1)]),n.explanation?(i(),c("div",ge,[t[8]||(t[8]=e("div",{class:"example-label"},"解释:",-1)),e("div",null,l(n.explanation),1)])):v("",!0)])]))),128))]),u.value.constraints?(i(),c("div",be,[t[10]||(t[10]=e("h3",null,"限制条件",-1)),e("div",{innerHTML:u.value.constraints},null,8,he)])):v("",!0)]),e("div",ye,[e("div",xe,[e("div",ke,[t[11]||(t[11]=e("span",{class:"language-label"},"编程语言:",-1)),s(B,{modelValue:p.value,"onUpdate:modelValue":t[0]||(t[0]=n=>p.value=n),placeholder:"选择语言",class:"language-select",size:"large",onChange:k},{default:a(()=>[(i(),c(L,null,z(y,n=>s(R,{key:n.value,label:n.label,value:n.value},{default:a(()=>[e("div",Ce,[e("span",{class:w(["language-icon",n.value])},l(n.icon),3),e("span",null,l(n.label),1)])]),_:2},1032,["label","value"])),64))]),_:1},8,["modelValue"])]),e("div",we,[s(b,{content:"重置为初始代码",placement:"top",effect:"light"},{default:a(()=>[s(g,{size:"default",onClick:k,icon:f(G)},{default:a(()=>t[12]||(t[12]=[m("重置代码")])),_:1},8,["icon"])]),_:1}),s(b,{content:"运行并测试你的代码",placement:"top",effect:"light"},{default:a(()=>[s(g,{size:"default",type:"primary",onClick:j,icon:f(K)},{default:a(()=>t[13]||(t[13]=[m("运行代码")])),_:1},8,["icon"])]),_:1}),s(b,{content:"提交你的解答",placement:"top",effect:"light"},{default:a(()=>[s(g,{size:"default",type:"success",onClick:P,icon:f(O)},{default:a(()=>t[14]||(t[14]=[m("提交")])),_:1},8,["icon"])]),_:1})])]),e("div",Se,[e("div",Ve,[e("div",Le,[e("span",{class:w(["language-icon",p.value])},l(H()),3),e("span",null,l(J()),1)]),e("div",ze,[s(b,{content:"编写解决方案，然后点击运行代码测试",placement:"top"},{default:a(()=>[s(C,null,{default:a(()=>[s(f(Q))]),_:1})]),_:1})])]),s(F,{modelValue:x.value,"onUpdate:modelValue":t[1]||(t[1]=n=>x.value=n),type:"textarea",rows:20,placeholder:"输入你的代码...",class:"code-textarea",spellcheck:!1,resize:"none"},null,8,["modelValue"])]),o.value.show?(i(),c("div",{key:0,class:w(["run-result",{success:o.value.status==="success",error:o.value.status==="error"}])},[e("div",Te,[t[16]||(t[16]=e("span",null,"运行结果",-1)),s(g,{type:"text",onClick:t[2]||(t[2]=n=>o.value.show=!1)},{default:a(()=>t[15]||(t[15]=[m("关闭")])),_:1})]),e("div",De,[o.value.status==="success"?(i(),c("div",Me,[s(C,null,{default:a(()=>[s(f(W))]),_:1}),t[17]||(t[17]=e("span",null,"所有测试用例通过!",-1))])):o.value.status==="error"?(i(),c("div",je,[s(C,null,{default:a(()=>[s(f(X))]),_:1}),e("span",null,l(o.value.message),1)])):v("",!0),o.value.output?(i(),c("div",Pe,[t[18]||(t[18]=e("div",{class:"panel-header"},"输出:",-1)),e("pre",null,l(o.value.output),1)])):v("",!0),o.value.expected?(i(),c("div",He,[t[19]||(t[19]=e("div",{class:"panel-header"},"预期输出:",-1)),e("pre",null,l(o.value.expected),1)])):v("",!0)])],2)):v("",!0)])]))])),[[I,h.value]])}}});const Fe=Y(Je,[["__scopeId","data-v-820461ac"]]);export{Fe as default};
