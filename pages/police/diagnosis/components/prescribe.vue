<template>
	<view>
		<scroll-view class="swiper" scroll-y :scroll-into-view="intoView">
			<view class="swiper-item">
				<view class="form" :class="{ cushion: addCushion }">
					<!-- 基本信息 -->
					<view class="form-row">
						<view class="form-col">
							<view class="fields">
								<text class="text">姓名：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.name || '无' }}</view>
						</view>
						<view class="form-col">
							<view class="fields">
								<text class="text">监室号：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.prisonNo || '无' }}</view>
						</view>
						<view class="form-col">
							<view class="fields">
								<text class="text">出生年月：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner.birthday | dateFormatFilter }}</view>
						</view>
					</view>
					<!-- 基本信息 -->
					<view class="form-row">
						<view class="form-col">
							<view class="fields">
								<text class="text">性别：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.sex || '无' }}</view>
						</view>
						<view class="form-col">
							<view class="fields">
								<text class="text">档案编号：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.archivesNo || '无' }}</view>
						</view>
						<view class="form-col">
							<view class="fields">
								<text class="text">入所时间：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner.entryTime | dateFormatFilter }}</view>
						</view>
					</view>
					<view class="form-row">
						<view class="form-col">
							<view class="fields">
								<text class="text">健康状态：</text>
							</view>
							<view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.healthStatus || '无' }}</view>
						</view>
						<view class="form-col col-2">
							<view class="fields req">
								<text class="text">症状/主诉：</text>
							</view>
							<!-- 详情：症状 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input">{{ details && details.symptom || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<input v-else class="inside-border input" :class="{
                       'lack-val': !medicineParams.symptom
                     }" v-model="medicineParams.symptom" type='text' placeholder="请输入症状/主诉" />
						</view>
					</view>
					<!-- 药物过敏/处方时间 -->
					<view class="form-row">
						<view class="form-col">
							<view class="fields req">
								<text class="text">药物过敏：</text>
							</view>
							<!-- 详情：过敏 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input">{{ details && details.allergy || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<input v-else class="inside-border input" :class="{
                       'lack-val': !medicineParams.allergy
                     }" v-model="medicineParams.allergy" type='text' placeholder="请输入药物过敏" />
						</view>
						<view class="form-col col-2">
							<view class="fields req">
								<text class="text">{{ !isShowDetails ? '处方时间' : details.dataSource == '0' ? '开药时间' : '处方时间' }}：</text>
							</view>
							<!-- 详情：出药 -->
							<view v-if="isShowDetails && details.dataSource == '0'" class="inside-border input">{{ details.outDate | dateFormatFilter }}</view>
							<!-- 详情：处方 -->
							<template v-else-if="isShowDetails">
								<view class="inside-border input" style="width: 236.1upx;">{{ details.prescribeStartTime | dateFormatFilter }}</view>
								-
								<view class="inside-border input" style="margin-right: 101.39upx; width: 236.1upx;">{{ details.prescribeEndTime | dateFormatFilter }}</view>
							</template>
							<!-- 表单 -->
							<template v-else>
								<e-picker mode="dateTime" @change="setMedicineStartTime">
									<div class="input inside-border" :class="{
                         'lack-val': !medicineParams.prescribeStartTime
                       }" style="width: 236.1upx;">
										{{ medicineParams.prescribeStartTime }}
										<span v-if="!medicineParams.prescribeStartTime" style="color: grey;">请选择开始时间</span>
									</div>
								</e-picker>
								-
								<e-picker mode="dateTime" @change="setMedicineEndTime">
									<div class="input inside-border" :class="{
                         'lack-val': !medicineParams.prescribeEndTime
                       }" style="margin-right: 101.39upx; width: 236.1upx;">
										{{ medicineParams.prescribeEndTime }}
										<span v-if="!medicineParams.prescribeEndTime" style="color: grey;">请选择结束时间</span>
									</div>
								</e-picker>
							</template>
						</view>
					</view>
					<!-- 疾病类型/特殊病 -->
					<view class="form-row" v-if="(isShowDetails && details.dataSource == '1') || !isShowDetails">
						<view class="form-col">
							<view class="fields req">
								<text class="text">疾病类型：</text>
							</view>
							<!-- 详情：疾病类型 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input">{{ details && details.diseaseType || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<view v-else class="inside-border input" :class="{
                      'lack-val': !medicineParams.diseaseType
                    }">
								<fuzzySearch placeholder="请选填疾病类型" ref="diseaseType" useFor="DiseaseType" @selected="selectDiseaseType" />
							</view>
						</view>
						<view class="form-col col-2">
							<view class="fields">
								<text class="text">特殊病：</text>
							</view>
							<!-- 详情：特殊病 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input">{{ details && details.special || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<view v-else class="inside-border input" style="margin-right: 362.5upx; width: 236.2upx;">
								<fuzzySearch placeholder="请选填特殊病" ref="special" useFor="Special" @selected="selectSpecial" />
							</view>
						</view>
					</view>
					<view class="form-row">
						<view class="form-col" v-if="isShowDetails">
							<view class="fields">
								<text class="text">体格检查：</text>
							</view>
							<view class="physique-info">
								<view class="physique-info-details">
									体温
									<input class="inside-border input" v-model="details.bodyTemperature" type="number" disabled>
									℃
								</view>
								<view class="physique-info-details">
									血压
									<input class="inside-border input" v-model="details.bloodPressure" type="number" disabled>
									mmHg
								</view>
								<view class="physique-info-details">
									脉搏
									<input class="inside-border input" v-model="details.pulse" type="number" disabled>
									次/min
								</view>
								<view class="physique-info-details">
									呼吸
									<input class="inside-border input" v-model="details.breathe" type="number" disabled>
									次/min
								</view>
							</view>
						</view>
						<view class="form-col" v-else>
							<view class="fields">
								<text class="text">体格检查：</text>
							</view>
							<view class="physique-info">
								<view class="physique-info-details">
									体温
									<input class="inside-border input" v-model="medicineParams.bodyTemperature" type="number">
									℃
								</view>
								<view class="physique-info-details">
									血压
									<input class="inside-border input" v-model="medicineParams.bloodPressure" type="number">
									mmHg
								</view>
								<view class="physique-info-details">
									脉搏
									<input class="inside-border input" v-model="medicineParams.pulse" type="number">
									次/min
								</view>
								<view class="physique-info-details">
									呼吸
									<input class="inside-border input" v-model="medicineParams.breathe" type="number">
									次/min
								</view>
							</view>
						</view>
					</view>
					<view class="form-row" v-if="(isShowDetails && details.dataSource == '1') || !isShowDetails">
						<view class="form-col">
							<view class="fields">
								<text class="text">一般检查：</text>
							</view>
							<!-- 详情：一般检查 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input" style="width: 960.417upx;">{{ details && details.commonCheck || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<input v-else class="inside-border input" style="width: 960.417upx;" v-model="medicineParams.commonCheck" type='text' placeholder="请输入一般检查" />
						</view>
					</view>
					<view class="form-row">
						<view class="form-col">
							<view class="fields req">
								<text class="text">初步诊断：</text>
							</view>
							<!-- 详情：初步诊断 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input" style="width: 960.417upx;">{{ details && details.diagnosis || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<input v-else class="inside-border input" :class="{
                       'lack-val': !medicineParams.diagnosis
                     }" style="width: 960.417upx;" v-model="medicineParams.diagnosis" type='text' placeholder="请输入初步诊断" />
						</view>
					</view>
					<view class="form-row" v-if="(isShowDetails && details.dataSource == '1') || !isShowDetails">
						<view class="form-col col-2">
							<view class="fields">
								<text class="text">治疗方案：</text>
							</view>
							<!-- 详情：治疗方案 -->
							<scroll-view v-if="isShowDetails" scroll-x style="width: auto;">
								<view class="inside-border input">{{ details && details.diseaseType || '无' }}</view>
							</scroll-view>
							<!-- 表单 -->
							<view v-else class="cure-wrapper">
								<input class="inside-border input" v-model="medicineParams.cure" type='text' placeholder="请选填治疗方案" @focus="showCureSchemeList = true" @input="showCureSchemeList = false" />
								<view class="cure-scheme-list inside-border" v-show="showCureSchemeList">
									<view class="cure-scheme-item" v-for="(cure, index) in cureSchemeList" :key="index" @click="selectCureScheme(cure)">
										{{ cure.field_name }}
									</view>
								</view>
							</view>
						</view>
						<view class="form-col">
							<view v-if="!isShowDetails" class="blue-btn default-btn" @click="handleShowTemplate">调用模板</view>
						</view>
					</view>
					<!-- 处方 -->
					<view class="form-row" id="prescription">
						<view class="form-col">
							<view class="fields req">
								<text class="text">处方：</text>
							</view>
							<view class="prescription-wrapper">
								<!-- 详情 -->
								<view v-if="isShowDetails" class="prescription">
									<view class="head">
										<text class="title flex-2">药品名称</text>
										<text class="title">规格</text>
										<text class="title flex-2">用量（每次）</text>
										<text class="title flex-2">单位</text>
										<text class="title flex-2">频率</text>
										<text class="title flex-2">药量天数</text>
										<text class="title flex-2">用法</text>
									</view>
									<ul class="list">
										<li class="list-row" v-for="(i, index) in details.recipeList" :key="index">
											<view class="list-col flex-2">
												{{ i.drugName }}
											</view>
											<text class="list-col">{{ i.format }}</text>
											<text class="list-col flex-2">{{ i.quantity / i.yypl / i.drugUseDays }}</text>
											<text class="list-col flex-2">{{ i.sydwValue }}</text>
											<text class="list-col flex-2">{{ i.yyplValue }}</text>
											<text class="list-col flex-2">{{ i.drugUseDays }}</text>
											<text class="list-col flex-2">{{ i.drugUsage }}</text>
										</li>
									</ul>
								</view>
								<!-- 表单 -->
								<prescription v-else view="prescription" ref="prescriptionList" :outDate="prescribeTime" @updateRecipe="setRecipeParams" @inputFoucus="inputFoucus" @inputBlur="inputBlur" />
							</view>
						</view>
					</view>
					<!-- 输液 -->
					<template v-if="!isShowDetails">
						<view class="form-row">
							<view class="form-col">
								<view class="fields req">
									<text class="text">是否输液：</text>
								</view>
								<radio-group @change="setPrescriptionObserve" class="input">
									<label class="form-label">
										<radio value="1" :checked="prescriptionParams.isObserve == '1'" />
										<view class="label-text">是</view>
									</label>
									<label class="form-label">
										<radio value="0" :checked="prescriptionParams.isObserve == '0'" />
										<view class="label-text">否</view>
									</label>
								</radio-group>
							</view>
							<view class="form-col col-2" :class="{ hid: prescriptionParams.isObserve == '0' }">
								<view class="fields req">
									<text class="text">输液时间：</text>
								</view>
								<e-picker mode="dateTime" @change="setPrescriptionStartTime">
									<div class="input inside-border" :class="{
                         'lack-val': !prescriptionParams.infuStartTime
                       }" style="width: 236.1upx;">
										{{ prescriptionParams.infuStartTime }}
										<span v-if="!prescriptionParams.infuStartTime" style="color: grey;">请选择开始时间</span>
									</div>
								</e-picker>
								-
								<e-picker mode="dateTime" @change="setPrescriptionEndTime">
									<div class="input inside-border" :class="{
                         'lack-val': !prescriptionParams.infuEndTime
                       }" style="margin-right: 101.39upx; width: 236.1upx;">
										{{ prescriptionParams.infuEndTime }}
										<span v-if="!prescriptionParams.infuEndTime" style="color: grey;">请选择结束时间</span>
									</div>
								</e-picker>
							</view>
						</view>
						<view class="form-row" v-if="prescriptionParams.isObserve == '1'">
							<view class="form-col">
								<view class="fields req">
									<text class="text">注射类型：</text>
								</view>
								<radio-group @change="setInjectionType" class="input" style="width: 960.417upx;">
									<label class="form-label">
										<radio value="1" :checked="injectionType == '1'" />
										<view class="label-text">皮下注射</view>
									</label>
									<label class="form-label">
										<radio value="2" :checked="injectionType == '2'" />
										<view class="label-text">肌肉注射</view>
									</label>
									<label class="form-label">
										<radio value="3" :checked="injectionType == '3'" />
										<view class="label-text">静脉静推</view>
									</label>
									<label class="form-label">
										<radio value="4" :checked="injectionType == '4'" />
										<view class="label-text">静脉滴注</view>
									</label>
								</radio-group>
							</view>
						</view>
						<view class="form-row" v-if="prescriptionParams.isObserve == '1'" id="observe">
							<view class="form-col">
								<view class="fields req">
									<text class="text">输液：</text>
								</view>
								<view class="prescription-wrapper">
									<prescription view="observe" ref="transfuseList" :outDate="prescribeTime" :isNeedGrouping="true" @updateRecipe="setObserveParams" @inputFoucus="inputFoucus" @inputBlur="inputBlur" />
								</view>
							</view>
						</view>
					</template>
					<!-- 详情：输液 -->
					<template v-else-if="isShowDetails && details.dataSource == '1'">
						<view class="form-row">
							<view class="form-col">
								<view class="fields req">
									<text class="text">是否输液：</text>
								</view>
								<radio-group class="input">
									<label class="form-label">
										<radio value="1" :checked="details.isObserve == '1'" disabled />
										<view class="label-text">是</view>
									</label>
									<label class="form-label">
										<radio value="0" :checked="details.isObserve == '0'" disabled />
										<view class="label-text">否</view>
									</label>
								</radio-group>
							</view>
							<view class="form-col col-2" :class="{ hid: details.isObserve == '0' }">
								<view class="fields req">
									<text class="text">输液时间：</text>
								</view>
								<div class="input inside-border" style="width: 236.1upx;">
									{{ details.infuStartTime | dateFormatFilter }}
								</div>
								-
								<div class="input inside-border" style="margin-right: 101.39upx; width: 236.1upx;">
									{{ details.infuEndTime | dateFormatFilter }}
								</div>
							</view>
						</view>
						<view class="form-row" v-if="details.isObserve == '1'">
							<view class="form-col">
								<view class="fields req">
									<text class="text">注射类型：</text>
								</view>
								<radio-group class="input" style="width: 960.417upx;">
									<label class="form-label">
										<radio value="1" :checked="details.injectionType == '1'" disabled />
										<view class="label-text">皮下注射</view>
									</label>
									<label class="form-label">
										<radio value="2" :checked="details.injectionType == '2'" disabled />
										<view class="label-text">肌肉注射</view>
									</label>
									<label class="form-label">
										<radio value="3" :checked="details.injectionType == '3'" disabled />
										<view class="label-text">静脉静推</view>
									</label>
									<label class="form-label">
										<radio value="4" :checked="details.injectionType == '4'" disabled />
										<view class="label-text">静脉滴注</view>
									</label>
								</radio-group>
							</view>
						</view>
						<view class="form-row" v-if="details.isObserve == '1'" id="observe">
							<view class="form-col">
								<view class="fields req">
									<text class="text">输液：</text>
								</view>
								<view class="prescription-wrapper">
									<view class="prescription">
										<view class="head">
											<text class="title flex-2">药品名称</text>
											<text class="title">规格</text>
											<text class="title flex-2">用量（每次）</text>
											<text class="title flex-2">单位</text>
											<text class="title flex-2">频率</text>
											<text class="title flex-2">药量天数</text>
											<text class="title flex-2">用法</text>
											<text class="title flex-2">分组</text>
										</view>
										<ul class="list">
											<li class="list-row" v-for="(i, index) in details.transfuseList" :key="index">
												<view class="list-col flex-2">
													{{ i.drugName }}
												</view>
												<text class="list-col">{{ i.format }}</text>
												<text class="list-col flex-2">{{ i.quantity / i.yypl / i.drugUseDays }}</text>
												<text class="list-col flex-2">{{ i.sydwValue }}</text>
												<text class="list-col flex-2">{{ i.yyplValue }}</text>
												<text class="list-col flex-2">{{ i.drugUseDays }}</text>
												<text class="list-col flex-2">{{ i.drugUsage }}</text>
												<text class="list-col flex-2">{{ i.drugGroup }}</text>
											</li>
										</ul>
									</view>
								</view>
							</view>
						</view>
					</template>
					<!-- 复诊 -->
					<view v-if="!isShowDetails" class="form-row">
						<view class="form-col">
							<view class="fields req">
								<text class="text">需要复诊：</text>
							</view>
							<radio-group @change="setPrescriptionDiagnoseAgain" class="input">
								<label class="form-label">
									<radio value="1" :checked="prescriptionParams.isNeed == '1'" />
									<view class="label-text">是</view>
								</label>
								<label class="form-label">
									<radio value="0" :checked="prescriptionParams.isNeed == '0'" />
									<view class="label-text">否</view>
								</label>
							</radio-group>
						</view>
						<view class="form-col col-2" :class="{ hid: prescriptionParams.isNeed == '0' }">
							<view class="fields req">
								<text class="text">复诊时间：</text>
							</view>
							<e-picker mode="dateTime" @change="setPrescriptionDiagnoseAgainTime">
								<div class="input inside-border" :class="{
                       'lack-val': !prescriptionParams.followTime
                     }" style="margin-right: 362.5upx; width: 236.2upx;">
									{{ prescriptionParams.followTime }}
									<span v-if="!prescriptionParams.followTime" style="color: grey;">请选择复诊时间</span>
								</div>
							</e-picker>
						</view>
					</view>
					<!-- 详情：复诊 -->
					<view v-else-if="isShowDetails && details.dataSource == '1'" class="form-row">
						<view class="form-col">
							<view class="fields req">
								<text class="text">需要复诊：</text>
							</view>
							<radio-group class="input">
								<label class="form-label">
									<radio value="1" :checked="details.isNeed == '1'" disabled />
									<view class="label-text">是</view>
								</label>
								<label class="form-label">
									<radio value="0" :checked="details.isNeed == '0'" disabled />
									<view class="label-text">否</view>
								</label>
							</radio-group>
						</view>
						<view class="form-col col-2" :class="{ hid: details.isNeed == '0' }">
							<view class="fields req">
								<text class="text">复诊时间：</text>
							</view>
							<div class="input inside-border" style="margin-right: 362.5upx; width: 236.2upx;">
								{{ details.followTime | dateFormatFilter }}
							</div>
						</view>
					</view>
					<view class="form-row">
						<view class="form-col">
							<view class="fields">
								<text class="text">医师：</text>
							</view>
							<!-- 详情：医师 -->
							<view v-if="isShowDetails" class="inside-border input">{{ personInfo.name }}</view>
							<!-- 表单 -->
							<view v-else class="inside-border input">{{ personInfo.name }}</view>
						</view>
						<view class="form-col col-2">
							<view class="fields">
								<text class="text">巡诊时间：</text>
							</view>
							<!-- 详情：巡诊时间 -->
							<view v-if="isShowDetails" class="inside-border input" style="margin-right: 362.5upx; width: 236.2upx;">{{ details.treatTime | dateFormatFilter }}</view>
							<!-- 表单 -->
							<view v-else class="inside-border input" style="margin-right: 362.5upx; width: 236.2upx;">{{ medicineParams.treatTime }}</view>
						</view>
					</view>
					<view v-if="!isShowDetails" class="form-row">
						<view class="transparent-btn default-btn" @click="handleMakePrescription(2)">暂存处方</view>
						<view class="blue-btn default-btn" @click="handleMakePrescription(1)">开具处方</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<neil-modal :show="showTemplate" :autoClose="true" @close="handleTemplateClose">
			<view class="template-wrapper">
				<!-- 顶部操作栏 -->
				<view class="modal-header" style="padding: 0;">
					<view class="modal-title">处方模板</view>
					<div class="modal-close" @click="handleTemplateClose">
						<image src="/static/images/common/close.png"></image>
					</div>
				</view>
				<view class="page-horizontal-divider" style="margin-bottom: 30upx;"></view>
				<view class="template-content">
					<view class="template-content-row" style="position: relative;">
						<label>模板选择：</label>
						<xfl-select :list="templateList" :clearable="false" :placeholder="'请选择模板'" @change="handleTemplateChange"></xfl-select>
					</view>
					<view class="template-content-row btn-wrapper">
						<view class="transparent-btn default-btn" @click="handleTemplateClose">取消</view>
						<view class="blue-btn default-btn" @click="changeTemplateConfirm">确定</view>
					</view>
				</view>
			</view>
		</neil-modal>
	</view>
</template>

<script>
import Api from '@/common/api.js';

import ePicker from "@/components/e-picker/e-picker.vue";
import xflSelect from "@/components/xfl-select/xfl-select.vue";
import prescription from "./prescription.vue";
import fuzzySearch from './fuzzySearch.vue';

import { dateFormat } from "@/common/utils/util.js";

export default {
	name: 'prescribe',
	components: {
		ePicker,
		xflSelect,
		prescription,
		fuzzySearch
	},
	props: {
		selectedPrisoner: {
			type: Object,
			default () {
				return {};
			}
		},
		personInfo: {
			type: Object,
			default () {
				return {};
			}
		},
		isShowDetails: {
			type: Boolean,
			default: false
		},
		details: {
			type: Object,
			default () {
				return {};
			}
		},
		nowTimestamp: {
			type: Number,
			default: 0
		}
	},
	data () {
		return {
			showTemplate: false,
			templateList: [
				{
					value: '模板1',
					code: 1
				},
				{
					value: '模板2',
					code: 2
				},
				{
					value: '模板3',
					code: 3
				},
				{
					value: '模板4',
					code: 4
				},
				{
					value: '模板5',
					code: 5
				},
				{
					value: '模板6',
					code: 6
				},
			],
			showCureSchemeList: false,
			cureSchemeList: [], // 治疗方案列表
			curTemplate: {},
			intoView: '',
			addCushion: false,
			// 当前时间 => 开药时间
			prescribeTime: dateFormat('YYYY-MM-DD hh:mm', new Date()),
			// 出药基础参数
			medicineParams: {
				drugOutStockFlag: 0,
				cure: '', // 治疗
				bodyTemperature: '', // 体温
				bloodPressure: '', // 血压
				pulse: '', // 脉搏
				breathe: '', // 呼吸
				commonCheck: '', // 一般检查
				symptom: '', // 症状
				allergy: '', // 过敏
				diagnosis: '', // 初步诊断
				doctors: '', // 医师
				prescribeStartTime: '', // 处方开始时间
				prescribeEndTime: '', // 处方结束时间
				diseaseType: '', // 疾病类型
				special: '', // 特殊病
				treatTime: dateFormat('YYYY-MM-DD hh:mm', new Date()), // 巡诊时间
				dataSource: 1
			},
			// 输液/复诊参数
			prescriptionParams: {
				isObserve: '0', // 是否输液
				infuStartTime: '', // 开始时间
				infuEndTime: '', // 结束时间
				isNeed: '0', // 是否复诊
				followTime: '' // 复诊时间
			},
			injectionType: '1', // 注射类型
			// 处方清单
			recipeParams: [],
			// 输液清单
			observeParams: [],
			// 基础参数验证
			baseValidate: {
				symptom: '请输入症状/主诉！',
				allergy: '请输入药物过敏！',
				diagnosis: '请输入初步诊断！',
				prescribeStartTime: '请输入处方开始时间！',
				prescribeEndTime: '请输入处方结束时间！',
				diseaseType: '请输入疾病类型！'
			},
			preValidate: {
				infuStartTime: '请填选输液开始时间！',
				infuEndTime: '请填选输液结束时间！',
				followTime: '请填选复诊时间！'
			},
			// 处方参数验证
			recipeValidate: {
				drugName: '请填选药品名称！',
				quantity: '请输入数量！',
				drugUsage: '请输入用法！',
				drugUseDays: '请输入药量天数！',
				yypl: '请输入频率！',
				sydw: '请输入单位！'
			}
		};
	},
	watch: {
		nowTimestamp (val) {
			this.medicineParams.treatTime = dateFormat('YYYY-MM-DD hh:mm', new Date(val));
		}
	},
	filters: {
		dateFormatFilter (val) {
			if (!val) return '无';
			return dateFormat('YYYY-MM-DD', new Date(val));
		}
	},
	methods: {
		hideResult () {
			try {
				this.$refs.diseaseType && this.$refs.diseaseType.hideResult();
				this.$refs.special && this.$refs.special.hideResult();
				this.$refs.prescriptionList && this.$refs.prescriptionList.hideResult();
				this.$refs.transfuseList && this.$refs.transfuseList.hideResult();
			} catch (error) {
			}
		},
		inputFoucus (view) {
			this.intoView = '';
			this.addCushion = true;
			this.$forceUpdate();
			this.$nextTick(() => {
				this.intoView = view;
			});
		},
		inputBlur () {
			this.$forceUpdate();
			this.$nextTick(() => {
				this.addCushion = false;
			});
		},
		// 设置处方清单
		setRecipeParams (recipe) {
			this.recipeParams = recipe;
		},
		// 设置输液清单
		setObserveParams (recipe) {
			this.observeParams = recipe;
		},
		// 选择疾病类型
		selectDiseaseType (detail) {
			this.medicineParams.diseaseType = detail.diseaseType;
		},
		// 选择治疗
		selectCureScheme (e) {
			this.medicineParams.cure += e.field_name;
			this.showCureSchemeList = false;
		},
		// 选择特殊病 
		selectSpecial (detail) {
			this.medicineParams.special = detail.special;
		},
		// 设置开药开始时间
		setMedicineStartTime (time) {
			this.medicineParams.prescribeStartTime = time;
		},
		// 设置开药结束时间
		setMedicineEndTime (time) {
			this.medicineParams.prescribeEndTime = time;
		},
		// 设置是否输液
		setPrescriptionObserve (e) {
			this.prescriptionParams.isObserve = e.detail.value;
			if (!e.detail.value) {
				this.injectionType = '';
				this.medicineParams.cure = '';
				this.prescriptionParams.infuStartTime = '';
				this.prescriptionParams.infuEndTime = '';
				this.observeParams = [];
			} else {
				this.injectionType = '1';
			}
		},
		// 设置注射类型
		setInjectionType (e) {
			this.injectionType = e.detail.value;
		},
		// 设置输液开始时间
		setPrescriptionStartTime (time) {
			this.prescriptionParams.infuStartTime = time;
		},
		// 设置输液结束时间
		setPrescriptionEndTime (time) {
			this.prescriptionParams.infuEndTime = time;
		},
		// 设置是否需要复诊
		setPrescriptionDiagnoseAgain (e) {
			this.prescriptionParams.isNeed = e.detail.value;
			if (!e.detail.value) {
				this.prescriptionParams.followTime = '';
			}
		},
		// 设置复诊时间
		setPrescriptionDiagnoseAgainTime (time) {
			this.prescriptionParams.followTime = time;
		},
		// 设置开处方参数
		handleMakePrescription (dataSource) {
			this.medicineParams.doctors = this.personInfo.userId;
			this.medicineParams.personCode = this.selectedPrisoner.rybh;
			this.handleParamsValidate().then(() => {
				this.makePrescription(dataSource);
			});
		},
		// 必填项判断
		handleParamsValidate () {
			return new Promise((resolve, reject) => {
				// 验证基础参数
				let baseRule = this.baseValidate;
				let allPass = true;
				for (const key in baseRule) {
					if (Object.hasOwnProperty.call(baseRule, key)) {
						if (!this.medicineParams[key]) {
							allPass = false;
							break;
						}
					}
				}
				// 验证输液
				if (allPass && this.prescriptionParams.isObserve == '1') {
					if (!this.prescriptionParams.infuStartTime || !this.prescriptionParams.infuEndTime) {
						allPass = false;
					}
					if (this.observeParams.length) {
						let recipeRule = this.recipeValidate;
						this.observeParams.forEach(recipe => {
							for (const key in recipeRule) {
								if (Object.hasOwnProperty.call(recipeRule, key)) {
									if (!recipe[key]) {
										allPass = false;
										break;
									}
								}
							}
						});
					} else {
						allPass = false;
					}
				}
				// 验证处方
				if (allPass) {
					if (this.recipeParams.length) {
						let recipeRule = this.recipeValidate;
						this.recipeParams.forEach(recipe => {
							for (const key in recipeRule) {
								if (Object.hasOwnProperty.call(recipeRule, key)) {
									if (!recipe[key]) {
										allPass = false;
										break;
									}
								}
							}
						});
					} else if (!this.recipeParams.length && this.prescriptionParams.isObserve == '0') {
						allPass = false;
					}
				}
				// 验证复诊
				if (allPass && this.prescriptionParams.isNeed == '1') {
					if (!this.prescriptionParams.followTime) {
						allPass = false;
					}
				}
				if (allPass) {
					resolve();
				} else {
					uni.showToast({
						title: '开具处方失败，请填写完整表格！',
						position: 'center',
						icon: "none",
					});
				}
			});
		},
		// 开处方
		async makePrescription (dataSource) {
			let isEnough = true; // 判断库存
			let lackDrug = '';
			let baseInfo = Object.assign({}, this.medicineParams, this.prescriptionParams);
			let PacMPrescribeDetailsDO = this.recipeParams.concat(this.observeParams);
			let pacMDrugManageDO = [];
			PacMPrescribeDetailsDO.map(i => {
				let obj = {
					id: i.drugManageId,
					drugSpecific: i.drugSpecific
				};
				let quantity = i.quantity * i.yypl * i.drugUseDays;
				if (isEnough) {
					if (quantity > i.remainStorehouse) {
						isEnough = false;
						lackDrug = i.drugName;
					} else {
						i.quantity = quantity;
						i.outgoer = this.personInfo.userId;
						pacMDrugManageDO.push(obj);
						return i;
					}
				}
			});
			if (!isEnough) {
				return uni.showToast({
					title: `开具处方失败，${lackDrug}库存不足！`,
					position: 'center',
					icon: "none",
				});
			}
			if (dataSource == 2) {
				baseInfo = Object.assign({}, baseInfo, {
					isDelete: 2
				});
			}
			let params = {
				injectionType: this.injectionType,
				pacMPrescribeDO: baseInfo,
				PacMPrescribeDetailsDO,
				pacMDrugManageDO
			};
			let res = await Api.apiCall('post', Api.police.diagnosis.makePrescription, params, true);
			this.recipeParams = [];
			this.observeParams = [];
			this.$refs.prescriptionList && this.$refs.prescriptionList.clearList();
			this.$refs.transfuseList && this.$refs.transfuseList.clearList();
			if (res.state.code == 200) {
				uni.showToast({
					title: res.data || '开具处方成功！',
					position: 'center',
					icon: "none",
				});
			} else {
				uni.showToast({
					title: (res.state && res.state.msg) || `开具处方失败！code：${res.state && res.state.code}`,
					position: 'center',
					icon: "none",
				});
			}
		},
		// 获取治疗方案
		async getCureScheme () {
			let res = await Api.apiCall('get', Api.police.diagnosis.getCureScheme, null, true);
			if (res.state.code == 200) {
				this.cureSchemeList = res.data;
			}
		},
		// 获取模板列表
		async getTemplateList () {
			let res = await Api.apiCall('get', Api.police.diagnosis.getTemplateList, null, true);
			if (res.state.code == 200) {
				this.templateList = res.data;
			}
		},
		// 获取模板详情
		async getTemplateDetails () {
			let res = await Api.apiCall('post', Api.police.diagnosis.getTemplateDetails, {
				data: {
					id: this.curTemplate
				}
			}, true);
			if (res.state.code == 200) {
				let list = res.data;
				this.recipeParams = list.filter(record => {
					return record.type == '1';
				});
				this.observeParams = list.filter(record => {
					return record.type == '3';
				});

				if (this.recipeParams.length) {
					this.$refs.prescriptionList && this.$refs.prescriptionList.updateList(this.recipeParams);
				}
				if (this.observeParams.length) {
					this.prescriptionParams.isObserve = '1';
					this.$nextTick(() => {
						this.$refs.transfuseList && this.$refs.transfuseList.updateList(this.observeParams);
					});
				}
			}
		},
		handleShowTemplate () {
			this.showTemplate = true;
		},
		handleTemplateClose () {
			this.showTemplate = false;
		},
		handleTemplateChange (e) {
			this.curTemplate = e.originItem.id;
		},
		changeTemplateConfirm () {
			this.getTemplateDetails();
			this.handleTemplateClose();
		}
	},
	beforeCreate () {
		uni.showLoading({
			title: "加载中..",
			mask: true,
		});
	},
	mounted () {
		uni.hideLoading();
		if (!this.isShowDetails) {
			this.getCureScheme();
			this.getTemplateList();
		}
	},
}
</script>

<style lang="less" scoped>
@import '@/common/less/unitConfig.less';
@import '@/common/less/form.less';
@import "@/common/less/neilModalHead.less";

.swiper {
	width: 100%;
	height: 470upx;
	.swiper-item {
		width: 100%;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;

		&.cushion {
			.px2upx(padding-bottom, 300);
		}
	}
	&.small-swiper {
		height: 427upx;
	}
}

.prescription-wrapper {
	.px2upx(width, 1405);
}

.transparent-btn {
	.px2upx(margin-right, 20);
	background-color: rgba(55, 151, 255, 0.16);
	border: 1px solid #3797ff;
}

.blue-btn {
	background-color: #007aff;
}

.default-btn {
	.px2upx(width, 160);
	.px2upx(height, 62);
	border-radius: 4px;
	.px2upx(font-size, 26);
	.px2upx(line-height, 62);
	text-align: center;
}

.prescription {
	width: 100%;
	.head {
		.px2upx(padding-left, 20);
		.px2upx(padding-right, 20);
		width: 100%;
		.px2upx(height, 62);
		display: flex;
		justify-content: flex-start;
		align-items: center;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		background-color: rgba(17, 62, 141, 0.5);
		box-sizing: border-box;
		.title {
			flex: 1;
			text-align: center;
			overflow: hidden;
			white-space: nowrap;
			.px2upx(font-size, 28);
			&.flex-2 {
				flex: 2;
			}
		}
	}
	.list {
		padding: 0;
		width: 100%;
		.list-row {
			.px2upx(padding-left, 20);
			.px2upx(padding-right, 20);
			width: 100%;
			.px2upx(height, 66);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			box-sizing: border-box;
			border-bottom: 1px solid rgba(17, 62, 141, 0.9);
			.list-col {
				flex: 1;
				text-align: center;
				.px2upx(font-size, 26);
				&.flex-2 {
					flex: 2;
				}
				&.red-font {
					color: red;
				}
			}
		}
	}
}

.physique-info {
	.px2upx(width, 1407);
	display: flex;
	justify-content: space-around;
	align-items: center;

	.physique-info-details {
		display: flex;
		justify-content: space-around;
		align-items: center;
		.px2upx(font-size, 26);
		.input {
			margin: 0 5upx;
			width: 50upx !important;
		}
	}
}

.template-wrapper {
	.px2upx(padding-left, 60);
	.px2upx(padding-right, 60);
	.px2upx(width, 720);
}

.template-content {
	.px2upx(height, 600);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	.template-content-row {
		position: relative;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		.px2upx(font-size, 26);

		&.btn-wrapper {
			justify-content: center;
		}
	}
}

.cure-wrapper {
	position: relative;
	.cure-scheme-list {
		position: absolute;
		left: 0;
		.px2upx(top, 60);
		background-color: #3797ff;
		.cure-scheme-item {
			.px2upx(padding-left, 20);
			.px2upx(padding-top, 5);
			.px2upx(padding-bottom, 5);
			.px2upx(width, 862);
			.px2upx(font-size, 26);
			&:active {
				background-color: #007aff;
			}
		}
	}
}
</style>