import{k as E,u as K,r as d,p as F,b as m,o as y,c as x,d as n,f as t,g as $,w as r,h as c,t as i,s as V,N as A}from"./index-8f7409db.js";import{_ as H}from"./_plugin-vue_export-helper-c27b6911.js";const O={class:"submissions-container"},q={class:"filter-section"},G={class:"pagination-container"},Q={class:"submission-detail"},W={class:"detail-header"},X={class:"detail-item"},Y={class:"detail-value"},Z={class:"detail-item"},ee={class:"detail-value"},te={class:"detail-item"},ne={class:"detail-value"},ae={class:"detail-item"},le={class:"detail-value"},se={class:"detail-item"},ie={class:"detail-value"},oe={class:"detail-item"},re={class:"detail-value"},ue={class:"detail-item"},de={class:"detail-value"},me={class:"code-section"},pe={class:"code-display"},ce={key:0,class:"error-section"},ge={class:"error-display"},ve={key:1,class:"test-cases"},_e=E({__name:"Submissions",setup(be){const k=K(),p=d(""),g=d(""),v=d(""),b=d(1),f=d(10),M=d(150),_=d(!1),s=d({id:"",problemId:"",problemTitle:"",status:"",runtime:0,memory:0,language:"",submitTime:"",code:""}),S=d([{id:"SUB123456",problemId:"1",problemTitle:"两数之和",status:"accepted",runtime:5,memory:8.2,language:"Python",submitTime:"2023-05-15 14:30:22",code:`def twoSum(nums, target):
    map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in map:
            return [map[complement], i]
        map[num] = i
    return []`},{id:"SUB123457",problemId:"2",problemTitle:"两数相加",status:"wrong-answer",runtime:10,memory:9.5,language:"Java",submitTime:"2023-05-15 15:12:45",code:`class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return null;
    }
}`,errorMessage:`测试用例 3 失败
输入: [3,3], 6
预期输出: [0,1]
实际输出: [1,0]`,testCases:[{index:1,input:"[2,7,11,15], 9",expected:"[0,1]",actual:"[0,1]",result:"pass"},{index:2,input:"[3,2,4], 6",expected:"[1,2]",actual:"[1,2]",result:"pass"},{index:3,input:"[3,3], 6",expected:"[0,1]",actual:"[1,0]",result:"fail"}]},{id:"SUB123458",problemId:"3",problemTitle:"无重复字符的最长子串",status:"time-limit-exceeded",runtime:2e3,memory:15.1,language:"C++",submitTime:"2023-05-16 09:45:31",code:`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.length();
        int ans = 0;
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                if (checkRepetition(s, i, j)) {
                    ans = max(ans, j - i + 1);
                }
            }
        return ans;
    }
    
    bool checkRepetition(string& s, int start, int end) {
        vector<int> chars(128);
        for (int i = start; i <= end; i++) {
            char c = s[i];
            chars[c]++;
            if (chars[c] > 1) {
                return false;
            }
        }
        return true;
    }
};`,errorMessage:"执行时间超过限制: 2000ms"},{id:"SUB123459",problemId:"4",problemTitle:"寻找两个正序数组的中位数",status:"compile-error",runtime:0,memory:0,language:"JavaScript",submitTime:"2023-05-16 11:22:18",code:`var findMedianSortedArrays = function(nums1, nums2) {
    const merged = [];
    let i = 0, j = 0;
    
    // 合并两个有序数组
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            merged.push(nums1[i++]);
        } else {
            merged.push(nums2[j++]);
        }
    }
    
    // 处理剩余元素
    while (i < nums1.length) {
        merged.push(nums1[i++]);
    }
    
    while (j < nums2.length) {
        merged.push(nums2[j++]);
    }
    
    // 计算中位数
    const mid = Math.floor(merged.length / 2);
    return merged.length % 2 === 0
        ? (merged[mid - 1] + merged[mid]) / 2
        : merged[mid];
};`,errorMessage:"SyntaxError: Unexpected token }"},{id:"SUB123460",problemId:"5",problemTitle:"最长回文子串",status:"runtime-error",runtime:15,memory:10.2,language:"Python",submitTime:"2023-05-17 16:08:45",code:`def longestPalindrome(s):
    if not s:
        return ""
    
    n = len(s)
    # 创建一个二维数组来存储子问题的解
    dp = [[False for _ in range(n)] for _ in range(n)]
    
    start = 0  # 回文子串的起始位置
    max_length = 1  # 回文子串的最大长度
    
    # 所有长度为1的子串都是回文
    for i in range(n):
        dp[i][i] = True
    
    # 检查长度为2的子串
    for i in range(n-1):
        if s[i] == s[i+1]:
            dp[i][i+1] = True
            start = i
            max_length = 2
    
    # 检查长度大于2的子串
    for length in range(3, n+1):
        for i in range(n-length+1):
            j = i + length - 1  # 子串的结束位置
            
            # 检查子串s[i..j]是否是回文
            if s[i] == s[j] and dp[i+1][j-1]:
                dp[i][j] = True
                start = i
                max_length = length
    
    return s[start:start+max_length]`,errorMessage:`IndexError: list index out of range
  File "<string>", line 25, in longestPalindrome
    if s[i] == s[j] and dp[i+1][j-1]:`}]),U=F(()=>!p.value&&!g.value&&!v.value?S.value:S.value.filter(l=>{const e=!p.value||l.problemTitle.toLowerCase().includes(p.value.toLowerCase())||l.problemId.includes(p.value)||l.id.includes(p.value),h=!g.value||l.status===g.value,u=!v.value||l.language.toLowerCase()===v.value.toLowerCase();return e&&h&&u})),C=l=>{switch(l){case"accepted":return"success";case"wrong-answer":return"danger";case"time-limit-exceeded":return"warning";case"memory-limit-exceeded":return"warning";case"compile-error":return"info";case"runtime-error":return"danger";default:return"info"}},T=l=>{switch(l){case"accepted":return"通过";case"wrong-answer":return"错误答案";case"time-limit-exceeded":return"超时";case"memory-limit-exceeded":return"内存溢出";case"compile-error":return"编译错误";case"runtime-error":return"运行时错误";default:return"未知"}},B=l=>{s.value=l,_.value=!0},z=()=>{_.value=!1},P=l=>{k.push(`/oj/problem/${l}`),_.value=!1},L=l=>{f.value=l},N=l=>{b.value=l};return(l,e)=>{const h=m("el-input"),u=m("el-option"),j=m("el-select"),o=m("el-table-column"),w=m("el-tag"),I=m("el-table"),R=m("el-pagination"),D=m("el-link"),J=m("el-dialog");return y(),x("div",O,[n("div",q,[t(h,{modelValue:p.value,"onUpdate:modelValue":e[0]||(e[0]=a=>p.value=a),placeholder:"搜索题目...","prefix-icon":$(A),clearable:"",class:"search-input"},null,8,["modelValue","prefix-icon"]),t(j,{modelValue:g.value,"onUpdate:modelValue":e[1]||(e[1]=a=>g.value=a),placeholder:"状态",clearable:""},{default:r(()=>[t(u,{label:"通过",value:"accepted"}),t(u,{label:"错误答案",value:"wrong-answer"}),t(u,{label:"超时",value:"time-limit-exceeded"}),t(u,{label:"内存溢出",value:"memory-limit-exceeded"}),t(u,{label:"编译错误",value:"compile-error"}),t(u,{label:"运行时错误",value:"runtime-error"})]),_:1},8,["modelValue"]),t(j,{modelValue:v.value,"onUpdate:modelValue":e[2]||(e[2]=a=>v.value=a),placeholder:"语言",clearable:""},{default:r(()=>[t(u,{label:"Python",value:"python"}),t(u,{label:"Java",value:"java"}),t(u,{label:"C++",value:"cpp"}),t(u,{label:"JavaScript",value:"javascript"})]),_:1},8,["modelValue"])]),t(I,{data:U.value,style:{width:"100%"},onRowClick:B},{default:r(()=>[t(o,{prop:"id",label:"提交ID",width:"100"}),t(o,{prop:"problemId",label:"题目ID",width:"100"}),t(o,{prop:"problemTitle",label:"题目"}),t(o,{prop:"status",label:"状态",width:"150"},{default:r(a=>[t(w,{type:C(a.row.status)},{default:r(()=>[c(i(T(a.row.status)),1)]),_:2},1032,["type"])]),_:1}),t(o,{prop:"runtime",label:"执行时间",width:"120"},{default:r(a=>[c(i(a.row.runtime)+" ms ",1)]),_:1}),t(o,{prop:"memory",label:"内存消耗",width:"120"},{default:r(a=>[c(i(a.row.memory)+" MB ",1)]),_:1}),t(o,{prop:"language",label:"语言",width:"120"}),t(o,{prop:"submitTime",label:"提交时间",width:"180"})]),_:1},8,["data"]),n("div",G,[t(R,{"current-page":b.value,"onUpdate:currentPage":e[3]||(e[3]=a=>b.value=a),"page-size":f.value,"onUpdate:pageSize":e[4]||(e[4]=a=>f.value=a),"page-sizes":[10,20,50,100],layout:"total, sizes, prev, pager, next, jumper",total:M.value,onSizeChange:L,onCurrentChange:N},null,8,["current-page","page-size","total"])]),t(J,{modelValue:_.value,"onUpdate:modelValue":e[6]||(e[6]=a=>_.value=a),title:"提交详情",width:"80%","before-close":z},{default:r(()=>[n("div",Q,[n("div",W,[n("div",X,[e[7]||(e[7]=n("span",{class:"detail-label"},"提交ID:",-1)),n("span",Y,i(s.value.id),1)]),n("div",Z,[e[8]||(e[8]=n("span",{class:"detail-label"},"题目:",-1)),n("span",ee,[t(D,{type:"primary",onClick:e[5]||(e[5]=a=>P(s.value.problemId))},{default:r(()=>[c(i(s.value.problemId)+". "+i(s.value.problemTitle),1)]),_:1})])]),n("div",te,[e[9]||(e[9]=n("span",{class:"detail-label"},"状态:",-1)),n("span",ne,[t(w,{type:C(s.value.status)},{default:r(()=>[c(i(T(s.value.status)),1)]),_:1},8,["type"])])]),n("div",ae,[e[10]||(e[10]=n("span",{class:"detail-label"},"语言:",-1)),n("span",le,i(s.value.language),1)]),n("div",se,[e[11]||(e[11]=n("span",{class:"detail-label"},"执行时间:",-1)),n("span",ie,i(s.value.runtime)+" ms",1)]),n("div",oe,[e[12]||(e[12]=n("span",{class:"detail-label"},"内存消耗:",-1)),n("span",re,i(s.value.memory)+" MB",1)]),n("div",ue,[e[13]||(e[13]=n("span",{class:"detail-label"},"提交时间:",-1)),n("span",de,i(s.value.submitTime),1)])]),n("div",me,[e[14]||(e[14]=n("h3",null,"提交的代码",-1)),n("div",pe,[n("pre",null,i(s.value.code),1)])]),s.value.errorMessage?(y(),x("div",ce,[e[15]||(e[15]=n("h3",null,"错误信息",-1)),n("div",ge,[n("pre",null,i(s.value.errorMessage),1)])])):V("",!0),s.value.testCases&&s.value.testCases.length>0?(y(),x("div",ve,[e[16]||(e[16]=n("h3",null,"测试用例结果",-1)),t(I,{data:s.value.testCases,border:""},{default:r(()=>[t(o,{prop:"index",label:"用例编号",width:"100"}),t(o,{prop:"input",label:"输入"}),t(o,{prop:"expected",label:"预期输出"}),t(o,{prop:"actual",label:"实际输出"}),t(o,{prop:"result",label:"结果",width:"100"},{default:r(a=>[t(w,{type:a.row.result==="pass"?"success":"danger"},{default:r(()=>[c(i(a.row.result==="pass"?"通过":"失败"),1)]),_:2},1032,["type"])]),_:1})]),_:1},8,["data"])])):V("",!0)])]),_:1},8,["modelValue"])])}}});const we=H(_e,[["__scopeId","data-v-b436133d"]]);export{we as default};
