<template>
    <div>
        <van-nav-bar
                fixed
                title="数据列表"
                right-text="我要留言"
                @click-right="popupShowMsg=true"
        />
        <div class="list-content" id="list-content">
            <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
                <van-list
                        v-model="loading"
                        :finished="finished"
                        @load="onLoad"
                        :offset="10"
                >
                    <div class="list-item" v-for="(item,index) in list" :key="index">
                        <!--留言标题-->
                        <van-row>
                            <van-col span="24" style="text-align: center"><div class="item-title" v-html="splitStr(item.title,20)"></div></van-col>
                        </van-row>

                        <!--用户名及留言日期-->
                        <van-row >
                            <van-col span="8"><div class="item-title">{{splitStr(item.uname,6)}}</div></van-col>
                            <van-col span="10" offset="6"><div class="item-time">{{timestampToTime(item.dtime)}}</div></van-col>
                        </van-row>

                        <!--留言内容-->
                        <van-row @click.native="showMessage(index)">
                            <van-col span="24"><div v-html="splitStr(item.content,100)"></div></van-col>
                        </van-row>

                        <!--留言图片-->
                        <template v-if="item.pic">
                            <van-row>
                                <van-col span="24">
                                    <swiper :options="swiperOption">
                                        <swiper-slide v-for=" (item ,index) in item.pic" :key="index">
                                            <div class="img-item">
                                                <img v-lazy="apis + item" @click="picShow(apis + item)"/>
                                            </div>
                                        </swiper-slide>
                                    </swiper>

                                </van-col>
                            </van-row>
                        </template>

                        <!--回复内容-->
                        <template v-if="item.greply">
                            <van-row>
                                <van-col span="8"><div class="item-title" style="color:red;">回复:</div></van-col>
                            </van-row>
                            <van-row @click.native="showMessage(index)">
                                <van-col span="24"><div v-html="splitStr(item.greply,100)"></div></van-col>
                            </van-row>
                            <!--回复图片-->
                            <template v-if="item.replypic">
                                <van-row>
                                    <van-col span="24">
                                        <swiper :options="swiperOption">
                                            <swiper-slide v-for=" (item ,index) in item.replypic" :key="index">
                                                <div class="img-item">
                                                    <img v-lazy="apis + item" @click="picShow(apis + item)"/>
                                                </div>
                                            </swiper-slide>
                                        </swiper>

                                    </van-col>
                                </van-row>
                            </template>
                        </template>

                    </div>
                </van-list>
            </van-pull-refresh>

            <!--留言详情的查看-->
            <van-popup
                    v-model="popupShowDetails"
                    position="right"
            >

                <van-nav-bar
                        fixed
                        title="详情"
                        left-text="返回"
                        left-arrow
                        @click-left="popupShowDetails=false"
                />
                <div class="message-content" v-if="list.length > 0">
                    <div class="list-item">
                        <!--留言标题-->
                        <van-row>
                            <van-col span="24" style="text-align: center"><div class="item-title" v-html="list[listIndex].title"></div></van-col>
                        </van-row>

                        <!--用户名及留言日期-->
                        <van-row >
                            <van-col span="8"><div class="item-title">{{list[listIndex].uname}}</div></van-col>
                            <van-col span="10" offset="6"><div class="item-time">{{timestampToTime(list[listIndex].dtime)}}</div></van-col>
                        </van-row>

                        <!--留言内容-->
                        <van-row>
                            <van-col span="24"><div v-html="list[listIndex].content"></div></van-col>
                        </van-row>

                        <!--回复内容-->
                        <template v-if="list[listIndex].greply">
                            <van-row>
                                <van-col span="8"><div class="item-title" style="color:red;">回复:</div></van-col>
                            </van-row>
                            <van-row>
                                <van-col span="24"><div v-html="list[listIndex].greply"></div></van-col>
                            </van-row>

                        </template>
                    </div>
                </div>
            </van-popup>
        </div>

        <!--查看图片-->
        <van-popup
                v-model="popupShowPic"
                :overlay="true"
        >
            <div class="pic-content">
                <div class="pic-content-left">
                    <img v-lazy="picPath"/>
                </div>

            </div>
        </van-popup>

        <!--留言-->
        <van-popup
                v-model="popupShowMsg"
                position="right"
        >
            <van-nav-bar
                    fixed
                    title="留言"
                    left-text="返回"
                    left-arrow
                    @click-left="messageback"
            />
            <div class="pic-content" style="margin-top:46px;">
                <van-cell-group>
                    <van-field v-model="title" placeholder="标题" label="标题" v-validate="'required|max:20'" name="标题"/>
                    <van-field v-model="name" placeholder="姓名"  label="姓名" v-validate="'required|max:20'" name="姓名"/>
                    <van-field v-model="tel" placeholder="手机号" label="手机号" v-validate="'required|phone'" name='联系电话' />
                    <van-field v-model="message" placeholder="留言内容" label="留言"  v-validate="'required|max:500'" type="textarea"  rows="5" name='留言内容'/>
                </van-cell-group>
                <van-row>
                    <van-col span="8" ><div style="font-size:14px;padding-left:1rem;">上传照片</div></van-col>
                    <van-col span="16">
                        <div style="text-align: center;">
                            <van-uploader :after-read="onRead">
                                <van-icon name="photograph" />
                            </van-uploader>
                        </div>
                    </van-col>
                </van-row>

                <!--图片上传-->
                <van-row>
                    <van-col span="24">

                        <swiper :options="swiperOption">
                            <swiper-slide v-for=" (item ,index) in imgs" :key="index">
                                <div class="img-item" style="height:6rem;position:relative;">
                                    <div style="text-align:center; position:absolute;left:5rem;" @click="clearImg(index)"> <van-icon name="clear" /></div>
                                    <img v-lazy="item.content" @click="picShow(item.content)" style="width:97%;height:100%"/>
                                </div>
                            </swiper-slide>
                        </swiper>

                    </van-col>
                </van-row>

                <div style="margin-top:1rem;">
                    <van-row>
                        <van-col span="11" offset="1">
                            <div style="padding:0.3rem">
                                <van-button type="primary" size="large" @click="submit" :loading="submitLoading">提  交</van-button>
                            </div>

                        </van-col>
                        <van-col span="11" offset="-1">
                            <div style="padding:0.3rem">
                                <van-button type="default" size="large" @click="reset">重  置</van-button>
                            </div>
                        </van-col>
                    </van-row>
                </div>

                <!--验证-->
                <div v-show="errors.any() && errorShow" v-cloak class="validate-error">
                    <p v-for="(v,i) in errors.all()">{{v}}</p>
                </div>
            </div>
        </van-popup>

    </div>
</template>

<script>
    import axios from 'axios'
    import qs from 'qs'
    import url from '@/serviceAPI.config.js'
    import Tool from '@/common.js'
    import 'swiper/dist/css/swiper.css'
    import { swiper, swiperSlide } from 'vue-awesome-swiper'
    import { Toast } from 'vant'
    export default {
        data(){
            return {
                apis:url.apis,          //代理
                list: [],               //数据列表
                loading: false,        //是否处于加载状态
                finished: false,       //是否已加载完所有数据
                isLoading: false,      //是否处于下拉刷新状态
                page:0,                 //当前页
                swiperOption: {         //轮播配置项
                    slidesPerView: 3
                },
                popupShowPic:false,        //图片面板显示
                picPath:'',                 //图片路径
                popupShowDetails:false,     //文字详情的显示
                listIndex:0,                //当前点击的文章索引
                popupShowMsg:false,         //我要留言
                title:'',                   //标题
                name:'',                    //姓名
                tel:'',                     //电话
                message:'',                  //留言
                imgs:[],                     //上传的图片
                submitLoading:false,        //按钮提交状态
                errorShow:true,             //验证错误的提示
            }
        },

        methods:{
            messageback(){
                this.popupShowMsg = false
                //console.log(this.errors)
                this.reset()
            },
            reset(){
                this.errorShow = false
                this.title=''                   //标题
                this.name=''                    //姓名
                this.tel=''                     //电话
                this.message=''                  //留言
                this.imgs = []                     //上传的图片
                //console.log(this.errors)
                setTimeout(()=>{
                    this.errors.items = []
                    this.errorShow = true
                },500)
            },
            submit(){                       //提交留言
              //console.log('test')
                this.$validator.validateAll().then(result=>{
                    if(result){
                        if(this.calculateSize()){
                            Toast.fail('上传图片大小限制为2M!')
                            return;
                        }
                        var imgs = [];
                        for(var i = 0; i < this.imgs.length; i++){
                            imgs.push(this.imgs[i].content)
                        }
                        let postData = qs.stringify({
                            title:this.title,
                            name:this.name,
                            tel:this.tel,
                            message:this.message,
                            imgs:imgs,
                        })
                        this.submitLoading = true
                        axios({
                            url:url.insertData,
                            method:'post',
                            data:postData,
                        }).then(response=>{
                            this.submitLoading = false
                            //console.log(response)
                            if(response.status == 200){
                                let data = response.data
                                if(data.code == 200){
                                    this.reset()
                                    Toast.success(data.msg);
                                } else {
                                    Toast.success(data.msg);
                                }

                            } else {
                                Toast.fail('请求失败');
                            }
                        }).catch(error=>{
                            this.submitLoading = false
                            console.log(error)
                        })
                    }
                })

            },
            clearImg(index){            //删除图片文件
                this.imgs.splice(index,1)
            },
            onRead(file) {              //文件读取完成后的回调函数
               // console.log(file)
                if(file){
                    this.imgs.push(file)
                }
                if(this.calculateSize()){
                    Toast.fail('上传图片大小限制为2M!')
                }
            },
            calculateSize(){            //计算已传图片的大小
                var imgsize = 0;
                for(var i = 0; i < this.imgs.length; i++){
                    imgsize = imgsize + this.imgs[i].file.size
                }
                console.log(imgsize);
                if(imgsize > 2097152){      //2m
                    return true
                }
                return false
            },
            showMessage:function(index){
                this.popupShowDetails = true
                this.listIndex = index
               // console.log(index);
            },
            picShow:function(value){            //显示图片
                this.popupShowPic = true
                this.picPath = value
                //console.log(value)
            },
            splitStr:function(value,length){    //字符串截取
                return Tool.splitStr(value,length)
            },
            timestampToTime:function(value){    //时间戳装换日期格式
                return Tool.timestampToTime(value)
            },
            onLoad() {                           //上拉加载
                setTimeout(()=>{
                    let postData = qs.stringify({
                        page:++this.page
                    })
                    axios({
                        url:url.getList,
                        method:'post',
                        data:postData,
                    })
                    .then(response=>{
                       // console.log(response);
                        if(response.status == 200 && response.data.code == 200){
                            let lastpage = response.data.data.lastpage
                            this.list = this.list.concat(response.data.data.list)
                            if(this.page == lastpage){
                                this.finished = true;
                            }
                        } else {
                            Toast.fail('没有可以显示的数据!')
                        }
                        this.loading = false
                    })
                    .catch(error=>{
                        console.log(error)
                    })
                },500)
            },
            onRefresh() {       //下拉刷新
                setTimeout(() => {
                    this.finished = false;
                    this.isLoading = false;
                    this.list = []
                    this.page = 0
                    this.onLoad()
                }, 500);
            }
        },
        mounted(){
            let winHeight = document.documentElement.clientHeight                          //视口大小
            document.getElementById('list-content').style.height = (winHeight - 46) +'px'  //调整上拉加载框高度
        },
        components:{
            swiper,
            swiperSlide,
        }
    }
</script>

<style lang="less" scoped>

    .list-content{
        margin-top:46px;
        overflow:scroll;
        .list-item{
            text-align:left;
            font-size:14px;
            padding: 0.8rem;
            border-bottom: 5px solid #fff;
            .img-item{
                text-align: center;
                img{
                    width:97%;
                    height:6rem;
                }
            }
            .item-title{
                font-weight:bold;
            }
            .item-time{
                float: right;
                color:#c2c2c2;
                font-size:10px;
            }
        }
    }

    .pic-content{
        .pic-content-left{
            height:20rem;
            overflow: hidden;
            img{
                //width:100%;
                height:100%;
            }
        }

    }

    .van-popup{
        &--right {
            width: 100%;
            height: 100%;
        }
        .message-content{
            margin-top:46px;
            padding:1rem;
        }
    }
</style>