﻿/*
    Copyright 2016 Sony Corporation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/


/// <reference path="../include/interfaces.d.ts" />

/* tslint:disable:max-line-length no-string-literal */

module Garage {
    export module View {
        import Tools = CDP.Tools;
        import Framework = CDP.Framework;
        import JQUtils = Util.JQueryUtils;

        var TAG = "[Garage.View.PropertyAreaButtonBase] ";

       
        export class PropertyAreaButtonBase extends Backbone.View<Model.ButtonItem> {

            //DOMのプルダウンの値ををベースにModelを更新する。
            //DOMを生成・変更 ＞＞ DOMの値をModelに反映 ＞＞ Modelの内容でDOMを再生成の流れでViewを管理する。

            protected templateItemDetailFile_: string;
            protected availableRemotelist: IRemoteInfo[];
            protected DEFAULT_STATE_ID: number; // staeIdが入力されたなかったとき、代入される値
            protected defaultState: IGState; // Defaultのstate

            /**
             * constructor
             */
            constructor(options?: Backbone.ViewOptions<Model.ButtonItem>) {
                super(options);
                this.templateItemDetailFile_ = Framework.toUrl("/templates/item-detail.html");
                this.availableRemotelist = huisFiles.getSupportedRemoteInfoInMacro();
                this.DEFAULT_STATE_ID = 0;
                //stateIdはデフォルト値とする。
                this.defaultState = this.model.state[this.DEFAULT_STATE_ID];
            }






            /////////////////////////////////////////////////////////////////////////////////////////
            ///// event method
            /////////////////////////////////////////////////////////////////////////////////////////

            events() {
                // Please add events
                return {
                    
                };
            }

            //signalContainerがマウスオーバーされたときに呼び出される
            protected onHoverInSignalContainer(event: Event) {
                let FUNCTION_NAME = TAG + "onHoverInSignalContainer";

                let $target = $(event.currentTarget).find(".signal-control-button");
                if (this.isValidJQueryElement($target)) {
                    $target.css("opacity","1");
                }
            }

            //signalContainerがマウスオーバーが外されたときに呼び出される
            protected onHoverOutSignalContainer(event: Event) {
                let FUNCTION_NAME = TAG + "onHoverOutSignalContainer";

                let $target = $(event.currentTarget).find(".signal-control-button");
                if (this.isValidJQueryElement($target)) {
                    $target.css("opacity", "0");
                }
            }



            /////////////////////////////////////////////////////////////////////////////////////////
            ///// public method
            /////////////////////////////////////////////////////////////////////////////////////////

            /*
            *保持しているモデルを取得する
            * @return {Model.BUttonItem}
            */
            public getModel(): Model.ButtonItem {
                return this.model;
            }


            /*
             * このクラス内のbuttonモデルのstateを、入力されたものに更新する
             * @param inputStates{IGState[]}
             */
            public setStates(inputStates: IGState[]) {
                let FUNCTION_NAME = "setState";

                if (inputStates == null){
                    console.warn(FUNCTION_NAME + "inputStates is null");
                    return;
                }

                this.model.state = inputStates;
                this.defaultState = this.model.state[this.DEFAULT_STATE_ID];
            }


            /////////////////////////////////////////////////////////////////////////////////////////
            ///// protected method
            /////////////////////////////////////////////////////////////////////////////////////////

         
            // 不正な値の場合、falseを返す。
            // 有効な場合、trueを返す。
            protected isValidValue(value): boolean {
                let FUNCTION_NAME = TAG + "isInvalidPullDownValue";

                if (value == null) {
                    return false;
                } else if (value == "none") {
                    return false;
                } else if (value === "") {
                    return false;
                } else if (JQUtils.isNaN(value)) {
                    return false;
                } else {
                    return true;
                }
            }

            /*
           * JQuery要素が有効か判定する
           * @param $target{JQuery}判定対象
           * @return {boolean} 有効な場合、true
           */
            protected isValidJQueryElement($target: JQuery): boolean {
                if ($target == null || $target.length == 0) {
                    return false;
                } else {
                    return true;
                }
            }

          
            /*
           * 入力したJQueryに登録されている order情報(何番目のマクロ信号か.0からはじまる)を取得する。
           * @param $target{JQuery} 対象となるJQuery
           * @return {number} order情報 みつからない場合、undefinedを返す。
           */
            protected getOrderFrom($target: JQuery): number {
                let FUNCTION_NAME = TAG + "getOrderFrom";

                if ($target == null) {
                    console.warn(FUNCTION_NAME + "$target is null");
                    return;
                }

                let result: number = parseInt(JQUtils.data($target, "signalOrder"), 10);

                if (! this.isValidOrder(result)) {
                    console.warn(FUNCTION_NAME + "result is invalid");
                    return undefined;
                }

                if (result != null) {
                    return result;
                } else {
                    return undefined;
                }
            }

            /*
             * 入力したJQueryに登録されている order情報(何番目のマクロ信号か.0からはじまる)を取得する。
             * @param $target{JQuery} 対象となるJQuery
             * @return {number} stateID みつからない場合、undefinedを返す。
             */
            protected getStateIdFrom($target: JQuery): number {
                let FUNCTION_NAME = TAG + "getStateIdFrom";

                if ($target == null) {
                    console.warn(FUNCTION_NAME + "$target is null");
                    return;
                }

                let result: number = parseInt(JQUtils.data($target, "stateId"), 10);

                if (result != null) {
                    return result;
                } else {
                    return undefined;
                }
            }


            /**
             * 入力したorderの信号に登録されているremoteIdをpulldownから取得する。
             * 見つからなかった場合、undefinedを返す。
             * @order{number} : remoeIdを取得したい信号の順番
             * @{string} remoteId
             */
            protected getRemoteIdFromPullDownOf(order: number): string {
                let FUNCTION_NAME = TAG + "getRemoteIdOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                let $signalContainerElement = this.getSignalContainerElementOf(order);
                if ($signalContainerElement == null) {
                    console.warn(FUNCTION_NAME + "$signalContainerElement is null");
                    return;
                }

                let remoteId: string = null;
                let $remotePullDown = $signalContainerElement.find(".remote-input[data-signal-order=\"" + order + "\"]");
                if ($remotePullDown == null || $remotePullDown.length == 0) {
                    console.warn(FUNCTION_NAME + "$remotePullDown is invalid");
                    return;
                }
                remoteId = $remotePullDown.val();

                //"none"も見つからない扱いとする。
                if (!this.isValidValue(remoteId)) {
                    return undefined;
                }

                return remoteId;

            }

            /*
            * 入力したorderのremoteIdのプルダウンのJQuery要素を返す。
            * @param order{number}
            * @return {JQuery}
            */
            protected getRemoteIdPullDownJQueryElement(order : number):JQuery{
                let FUNCTION_NAME = TAG + "getPullDownJQueryElement : ";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                let $signalContainerElement = this.getSignalContainerElementOf(order);
                if ($signalContainerElement == null) {
                    console.warn(FUNCTION_NAME + "$signalContainerElement is null");
                    return;
                }

                let $remoteIdPullDown = $signalContainerElement.find(".remote-input[data-signal-order=\"" + order + "\"]");
                if (!this.isValidJQueryElement($remoteIdPullDown)) {
                    console.warn(FUNCTION_NAME + "$remoteIdPullDown is invalid");
                    return;
                }

                return $remoteIdPullDown;
            }


            private _getRemoteNameOfUnknownRemote(unknownRemoteId: string) {
                let remoteId: string;
                switch (unknownRemoteId) {
                    case UNKNOWN_REMOTE_TV:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_TV");
                        break;
                    case UNKNOWN_REMOTE_AC:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_AC");
                        break;
                    case UNKNOWN_REMOTE_LIGHT:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_LIGHT");
                        break;
                    case UNKNOWN_REMOTE_AUDIO:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_AUDIO");
                        break;
                    case UNKNOWN_REMOTE_PLAYER:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_PLAYER");
                        break;
                    case UNKNOWN_REMOTE_RECORDER:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_RECORDER");
                        break;
                    case UNKNOWN_REMOTE_PROJECTOR:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_PROJECTOR");
                        break;
                    case UNKNOWN_REMOTE_STB:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_STB");
                        break;
                    case UNKNOWN_REMOTE_FAN:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_FAN");
                        break;
                    case UNKNOWN_REMOTE_BT:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE_BT");
                        break;
                    default:
                        remoteId = $.i18n.t("remote.STR_UNKNOWN_REMOTE");
                        break;
                }
                return remoteId;
            }



         /**
          * 入力したorderのremoteプルダウンに、inputの値を代入する。
          * order{number} ： マクロ信号の順番
          * inputRemoteId{string} : プルダウンに設定する値。
          */
            protected setRemoteIdPullDownOf(order: number, inputRemoteId: string, unknownRcId?: string) {
                let FUNCTION_NAME = TAG + "setIntervalPullDownOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                if (inputRemoteId == null) {
                    console.warn(FUNCTION_NAME + "inputRemoteId is null");
                    return;
                }

                let $signalContainerElement = this.getSignalContainerElementOf(order);
                if ($signalContainerElement == null) {
                    console.warn(FUNCTION_NAME + "$signalContainerElement is null");
                    return;
                }

                let $remoteIdPullDown = $signalContainerElement.find(".remote-input[data-signal-order=\"" + order + "\"]");
                if (!this.isValidJQueryElement($remoteIdPullDown)) {
                    console.warn(FUNCTION_NAME + "$remoteIdPullDown is invalid");
                    return;
                }

                let remoteName = null;
                if (unknownRcId != null && unknownRcId.indexOf(UNKNOWN_REMOTE) == 0) {
                    remoteName = this._getRemoteNameOfUnknownRemote(unknownRcId);
                } else {
                    let cachedDeviceInfo = this.getDeviceInfoByRemoteId(inputRemoteId);
                    if (this.isValidValue(cachedDeviceInfo)) {
                        remoteName = cachedDeviceInfo.remoteName;
                    }
                }

                if (remoteName != null) {
                    let additionalRemoteTemplrate: Tools.JST = Tools.Template.getJST("#template-property-button-signal-remote-additional-option", this.templateItemDetailFile_);
                    let inputSignalData = {
                        remoteId: inputRemoteId,
                        name: remoteName
                    }

                    let $additionalRemote = $(additionalRemoteTemplrate(inputSignalData));
                    $remoteIdPullDown.prepend($additionalRemote);
                   
                }

             

                $remoteIdPullDown.val(inputRemoteId);

            }

            /*
            * 入力したorder, stateIdのRemoteId設定用のプルダウンメニューを削除する
            * @param order{number}
            */
            protected removeRemoteIdPullDownOf(order: number) {
                let FUNCTION_NAME = TAG + "removeRemoteIdPullDownOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                //対象orderのfunctionPullDown用コンテナの子供を削除する
                let $targetSignalContainer: JQuery = this.$el.find(".signal-container-element[data-signal-order=\"" + order + "\"]");
                let $targetFunctionPullDownContainer: JQuery = $targetSignalContainer.find("#signal-remote-container");
                $targetFunctionPullDownContainer.children().remove();
            }


            /*
            * 入力したorderのremoteId用プルダウンに表示されている文字列を取得する
            * @param order{number}
            * @return {string} プルダウンに表示されている文字列
            */
            protected getTextInRemoteIdOf(order: number) :string{
                let FUNCTION_NAME = TAG + "getTextInRemoteIdOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                //対象orderのremoteIdPullDown用のテキストを返す。
                let $targetSignalContainer: JQuery = this.$el.find(".signal-container-element[data-signal-order=\"" + order + "\"]");
                return $targetSignalContainer.find("#signal-remote-container option:selected").text();

            }

            /*
            * 入力したorderのremoteId用プルダウンに入力されているのが「不明なリモコン」か判定する
            * @param order{number}
            * @return {boolean}
            */
            protected isUnknownRemoteIdInPulldownOf(order: number): boolean {
                let FUNCTION_NAME = TAG + "getTextInRemoteIdOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                let pullldownText = this.getTextInRemoteIdOf(order);

                switch (pullldownText) {
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_TV"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_AC"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_LIGHT"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_AUDIO"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_PLAYER"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_RECORDER"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_PROJECTOR"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_STB"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_FAN"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE_BT"):
                    case $.i18n.t("remote.STR_UNKNOWN_REMOTE"):
                        return true;
                    default: return false;

                }

            }


            /*
            * 入力したorderRemoteId用のプルダウンを描画する。
            * @param order{number} 描写するfunctionsプルダウンがどの順番の信号に属しているか
            * @param functionName{string} 描写するfunctionsプルダウンに設定する値。
            */
            protected renderRemoteIdOf(order: number, stateId?: number, inputRemoteId?: string, unknownRcId?: string) {
                let FUNCTION_NAME = TAG + "renderRemoteIdOf : ";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                //すでに、function選択用PullDownがある場合、削除する。
                this.removeRemoteIdPullDownOf(order);

                //targetとなるJQueryを取得
                let $target: JQuery = this.$el.find(".signal-container-element[data-signal-order=\"" + order + "\"]");
                if ($target == null || $target.length == 0) {
                    console.warn("$target is undefined");
                    return;
                }               

                //RemoteIdプルダウンのDOMを表示。
                let remoteList: IRemoteInfo[] = this.availableRemotelist.concat();  //加工する可能性があるのでコピーを生成
                if (remoteList != null) {
                    let $remoteContainer = $target.find("#signal-remote-container");
                    let templateRemote: Tools.JST = Tools.Template.getJST("#template-property-button-signal-remote", this.templateItemDetailFile_);

                    if (stateId == null) {
                        stateId = this.DEFAULT_STATE_ID;
                    }

                    let inputSignalData = {
                        id: stateId,
                        order: order,
                        remotesList: remoteList
                    }

                    let $functionsDetail = $(templateRemote(inputSignalData));
                    $remoteContainer.append($functionsDetail);

                    if (this.isValidValue(inputRemoteId) ) {
                        //inputにmodelがある場合、値を表示
                        this.setRemoteIdPullDownOf(order, inputRemoteId, unknownRcId);
                    }else{
                        //まだ、値がない場合、リストの一番上に、noneの値のDOMを追加。
                        let noneOption: Tools.JST = Tools.Template.getJST("#template-property-button-signal-remote-none-option", this.templateItemDetailFile_);
                        $remoteContainer.find("select").prepend(noneOption);
                        this.setRemoteIdPullDownOf(order, "none", unknownRcId);
                    }

                }
            }

            /*
             * アクションに設定されているFunctionNameを取得する
             * @param action{IAction} : functionNameを抽出するAction
             * @return {string} : functionName, 見つからない場合、 nullを返す。
             */
            protected getFunctionNameFromAction(action: IAction): string {
                let FUNCTION_NAME = TAG + "getFunctionNameFromAction : ";

                if (action == null) {
                    console.warn(FUNCTION_NAME + "action is null");
                    return null;
                }

                let result: string = null;

                if (action.code != null) {
                    result = action.code_db.function;
                } else if (action.bluetooth_data != null) {
                    result = action.bluetooth_data.bluetooth_data_content;
                } else if (action.code_db != null) {
                    result = action.code_db.function;
                } else {
                    //functionが取得できない
                }

                return result;
            }


            /*
             * アクションに設定されているリモコン信号がもつFunctionを取得する
             * @param action{IAction} : functionNameを抽出するAction
             * @return {string[]} : functions, 見つからない場合、 nullを返す。
             */
            protected getFunctionsFromAction(action: IAction) {
                let FUNCTION_NAME = TAG + "getFunctionsFromAction : ";

                if (action == null) {
                    console.warn(FUNCTION_NAME + "action is null");
                    return;
                }

                let remoteId = huisFiles.getRemoteIdByAction(action);
                if (remoteId == null) {
                    return;
                }

                if (action.deviceInfo.functions == null ||
                    action.deviceInfo.functions.length == 0) {
                    // functionsが無い場合はHuisFilesから検索
                    let functions: string[] = huisFiles.getMasterFunctions(remoteId);
                    action.deviceInfo.functions = functions;
                }

                return action.deviceInfo.functions;

            }

            /*
            * 入力したorderのfunctionsプルダウンに、inputの値を代入する。
            * order{number} ： マクロ信号の順番
            * inputFunctionNameId{string} : プルダウンに設定する値。
            */
            protected setFunctionNamePullDownOf(order: number, inputFunctionName: string) {
                let FUNCTION_NAME = TAG + "setFunctionNamePullDownOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                if (inputFunctionName == null) {
                    console.warn(FUNCTION_NAME + "setFunctionNamePullDownOf is null");
                    return;
                }

                let $signalContainerElement = this.getSignalContainerElementOf(order);
                if ($signalContainerElement == null) {
                    console.warn(FUNCTION_NAME + "$signalContainerElement is null");
                    return;
                }

                let $functionNamePullDown = $signalContainerElement.find(".function-input[data-signal-order=\"" + order + "\"]");
                if ($functionNamePullDown == null || $functionNamePullDown.length == 0) {
                    console.warn(FUNCTION_NAME + "$functionNamePullDown is invalid");
                    return;
                }

                $functionNamePullDown.val(inputFunctionName);
            }

            /*
            * 入力してorderの$signal-container-elementを返す。
            * @param order{number} 入手したい$signal-container-elementの順番
            * @return {JQuery} $signal-container-element
            */
            protected getSignalContainerElementOf(order: number): JQuery {
                let FUNCTION_NAME = TAG + "getSignalContainerElementOf";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                return this.$el.find(".signal-container-element[data-signal-order=\"" + order + "\"]");
            }

            /*
            * 入力したorderの信号に登録されているfunctionをpulldownから取得する。
            * 見つからなかった場合、undefinedを返す。
            * @order{number} : functionを取得したい信号の順番
            * @{string} functionName
            */
            protected getFunctionFromlPullDownOf(order: number): string {
                let FUNCTION_NAME = TAG + "getFunctionFromlPullDownOf : ";
                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                let $signalContainerElement = this.getSignalContainerElementOf(order);
                if ($signalContainerElement == null) {
                    console.warn(FUNCTION_NAME + "$signalContainerElement is null");
                    return;
                }

                let functionName: string = null;
                let $functionPullDown = $signalContainerElement.find(".function-input[data-signal-order=\"" + order + "\"]");
                if ($functionPullDown == null || $functionPullDown.length == 0) {
                    //正常系でも、functionPulldownがない場合はあり得る。
                    //console.warn(FUNCTION_NAME + "$functionPullDown is invalid");
                    return;
                }

                functionName = $functionPullDown.val();

                if (!this.isValidValue(functionName)) {
                    return undefined;
                }

                return functionName;
            }



            /*
         * 入力したorderのFunctionsを描画する。
         * @param order{number} 描写するfunctionsプルダウンがどの順番の信号に属しているか
         * @param functionName{string} 描写するfunctionsプルダウンに設定する値。
         */
            protected renderFunctionsOf(order: number, stateId? : number, functionName?: string, unknownRcId?: string) {
                let FUNCTION_NAME = TAG + "renderFunctionsOf : ";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                //すでに、function選択用PullDownがある場合、削除する。
                this.removeFunctionPullDown(order);

                //targetとなるJQueryを取得
                let $target: JQuery = this.$el.find(".signal-container-element[data-signal-order=\"" + order + "\"]");
                if ($target == null || $target.length == 0) {
                    console.warn("$target is undefined");
                    return;
                }

                let functions: string[];
                let remoteId: string = this.getRemoteIdFromPullDownOf(order);

                if (unknownRcId != null && unknownRcId.indexOf(UNKNOWN_REMOTE) == 0) {
                    if (functionName == null) {
                        functions = null;
                    } else {
                        functions = $.extend(true, [], [functionName]);
                    }
                } else {
                  
                    //ここでshallow copyしてしまうと、モデルの中の情報まで更新されてしまう。
                    functions = $.extend(true, [], this.getFunctionsOf(order));
                    
                }

                if (functions != null && functions.length != 0) {
                    // functionsに自分のキーが存在しない場合は追加
                    if (this.isValidValue(functionName) &&
                        functions.indexOf(functionName) < 0) {
                        functions.unshift(functionName);
                    }

                    let $functionlContainer = $target.find("#signal-function-container");
                    let templateFunctions: Tools.JST = Tools.Template.getJST("#template-property-button-signal-functions", this.templateItemDetailFile_);

                    if (stateId == null) {
                        stateId = this.DEFAULT_STATE_ID;
                    }



                    //functionsが0個の場合のエラーケース対応
                    let inputFunctions = [];
                    if (!(functions.length == 1 && functions[0] == null)) {
                        inputFunctions = Util.HuisFiles.translateFunctions(functions);
                    }

                    let inputSignalData = {
                        functions: inputFunctions,
                        id: stateId,
                        order: order
                    }
                    let $functionsDetail = $(templateFunctions(inputSignalData));
                    $functionlContainer.append($functionsDetail);

                    //inputにmodelがある場合、値を表示
                    if (this.isValidValue(functionName)) {
                        this.setFunctionNamePullDownOf(order, functionName);
                    } else {
                        //値がない場合、初期値をrender
                        let noneOption: Tools.JST = Tools.Template.getJST("#template-property-button-signal-functions-none-option", this.templateItemDetailFile_);
                        $functionlContainer.find("select").prepend(noneOption);
                        this.setFunctionNamePullDownOf(order, "none");
                    }
                }
            }

            /*
            * IButtonDeviceInfoをディープコピーする.
            * @param src {IButtonDeviceInfo} コピー元のIButtonDeviceInfo
            * @return {IButtonDeviceInfo} ディープコピーされたIButtonDeviceInfo
            */
            protected cloneDeviceInfo(src: IButtonDeviceInfo): IButtonDeviceInfo{
                let FUNCTION_NAME = TAG + "cloneDeviceInfo"; 

                if (!this.isValidValue(src)) {
                    console.warn(FUNCTION_NAME + "src is invalid");
                    return;
                }

                //deviceInfoを値渡しにすると、前後のorderに値が参照されてしまう。
                let result: IButtonDeviceInfo = {
                    id: src.id,
                    remoteName: (src.remoteName) ? src.remoteName : undefined,
                    functions: $.extend(true, [], src.functions),
                    code_db: $.extend(true, {}, src.code_db),
                    bluetooth_data: (src.bluetooth_data) ? $.extend(true, {}, src.bluetooth_data) : undefined,
                    functionCodeHash: (src.functionCodeHash) ? $.extend(true, [], src.functionCodeHash) : undefined
                }

                return result;

            }


            /*
            * 入力した信号名が #ID (例STR_REMOTE_BTN_TOGGLE#fads)なのか判定する。 危険多様しないこと。
            * @param functionName {string}
            * @return {boolean} #ID付きのfunctionの場合true,それ以外はfalse;
            */
            protected isRelearnedIDFunctionName(functionName: string): boolean {
                let FUNCTION_NAME = TAG + "isRelearnedIDFunctionName "; 
                if (!this.isValidValue(functionName)) {
                    return false;
                }

                let tmpFunctionNameParts = functionName.split(FUNC_CODE_RELEARNED);


                //#で区切った先がID文字数と同じな場合、trueを返す。
                if (tmpFunctionNameParts.length >= 2 &&
                    tmpFunctionNameParts[1].length == FUNC_ID_LEN) {
                    return true;
                } else {
                    return false;
                }
                  
            } 

            /*
            * 入力した信号名が 再学習用の##つきなのか判定する。 危険多様しないこと。
            * @param functionName {string}
            * @return {boolean} ##付きのfunctionの場合true,それ以外はfalse
            */
            protected isRelearnedFunctionName(functionName: string): boolean {
                let FUNCTION_NAME = TAG + "isRelearnedFunctionName ";
                if (!this.isValidValue(functionName)) {
                    return false;
                }



                //## を含んでいるとき、trueを返す。
                if (functionName.indexOf(FUNC_NUM_DELIMITER + FUNC_CODE_RELEARNED) != -1) {
                    return true;
                } else {
                    return false;
                }

            } 

            /*
            * 設定したOrderのfunction用PullDownを消す。
            * @param order {number}
            */
            protected removeFunctionPullDown(order: number) {
                let FUNCTION_NAME = TAG + "removeFunctionPullDown";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                //対象orderのfunctionPullDown用コンテナの子供を削除する
                let $targetSignalContainer: JQuery = this.$el.find(".signal-container-element[data-signal-order=\"" + order + "\"]");
                let $targetFunctionPulllDownContainer: JQuery = $targetSignalContainer.find("#signal-function-container");
                $targetFunctionPulllDownContainer.children().remove();
            }



            /*
           * 入力したorderのリモコンが持てる信号のリストFunctionsを返す。
           * @param order {number} 信号リストを取得したい、マクロ信号の順番
           * @param stateId? {number} 信号リストを取得したい、ボタンのstate
           * @return {string[]} 見つからなかった場合、undefinedを返す。
           */
            protected getFunctionsOf(order: number, stateId? : number) {
                let FUNCTION_NAME = TAG + "getRemoteIdOf : ";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }


                let remoteId: string = this.getRemoteIdFromPullDownOf(order);
                if (remoteId == null) {
                    return;
                }

                let functions = huisFiles.getAllFunctions(remoteId);

                if (functions == null || functions.length <= 0) {
                    try {
                        // HuisFilesに存在しない場合はキャッシュから表示
                        return this.getDeviceInfoByRemoteId(remoteId).functions;
                    } catch (e) {
                        // キャッシュもない場合
                        return;
                    }
                }

                return functions;
            }
          
          /*
           * ＋ボタンを押下する際のアニメーション. 
           * @param order{number} 出現するdom のorder
           * @param duration{number} アニメーションのduration
           */
            protected animateAddButton(order: number, duration:number, callback? : Function) {
                let FUNCTINO_NAME = TAG + "animateAddButton : ";


                if (!this.isValidValue(order)) {
                    console.warn(FUNCTINO_NAME + "order is invalid");
                    return;
                }

                let $target = this.getSignalContainerElementOf(order);

                //アニメがうまくいかないので、この位置でaddClass
                $target.addClass("before-add-animation");

                $target.find(".delete-signal-area").addClass("show");
                $target.find(".sort-button-area").addClass("show");
                //並び替え下ボタンは、非表示
                $target.find(".sort-button-area").addClass("last-order");

                //addボタン押下後、下から上に移動しながらフィードイン
                let tmpSignalContainerDuration = $target.css("transition-duration");
                this.setAnimationDuration($target, duration / 1000);
                $target.removeClass("before-add-animation");
                
                
                setTimeout(
                    () => {
                        $target.find(".delete-signal-area").removeClass("show");;
                        $target.find(".sort-button-area").removeClass("show");
                    }
                    , DURATION_ANIMATION_SHOW_SIGNAL_CONTAINER_CONTROLL_BUTTONS
                );

                setTimeout(
                    () => {
                        $target.css("transition-duration", tmpSignalContainerDuration);

                        if (callback) {
                            callback();
                        }

                    }
                    , duration
                );

            }


            /*
             * deleteボタンを押した際のアニメーション
             * @param order{number} 削除するdom のorder
             * duration{number} アニメーションにかかる時間[ms]
             * callback{Function} アニメーション後に実行する処理
             */
            protected animateDeleteSignalContainer(order: number, duration: number, callback?: Function) {
                let FUNCTION_NAME = TAG + "animateDeleteSignalContainer : ";

                if (!this.isValidOrder(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return;
                }

                let $target = this.getSignalContainerElementOf(order);
                if (!this.isValidJQueryElement($target)) {
                    console.warn(FUNCTION_NAME + "$target is invalid");
                    return;
                }

                //orderが0のとき order1のintervalのプルダウンと境界線も非表示にする
                if (order == 0) {
                    let targetOrder = 1;
                    if (this.isValidOrder(targetOrder)) {
                        let $orderOneSignalContainer = this.getSignalContainerElementOf(targetOrder);
                        let tmpDuration = $orderOneSignalContainer.css("transition-duration");
                        this.setAnimationDuration($orderOneSignalContainer, duration / 1000);

                        //境界線を非表示
                        $orderOneSignalContainer.find(".separate-line").css("opacity", "0");

                    }
                }


                //durationを設定,対象を透明に
                let tmpTargetDuration = $target.css("transition-duration");
                let tmpTargetMarginBottom = parseInt ($target.css("transition-duration").replace("px",""),10);
                this.setAnimationDuration($target, duration / 1000);
                $target.css("opacity", "0");
                $target.css("margin-bottom", tmpTargetMarginBottom - $target.outerHeight(true) + "px");

                setTimeout(() => {
                    //durationを元に戻す。
                    $target.css("transition-duration", tmpTargetDuration);

                    if (callback) {
                        callback();
                    }

                }, duration);

            }


            /*
            * アニメーションのdurationを設定する。
            * $target{JQuery} アニメーションを設定する対象
            * duration{number} アニメーションにかかる時間[ms]
            */
            protected setAnimationDuration($target: JQuery, duration: number) {
                let FUNCTION_NAME = TAG + "setAnimationDuration : ";

                if (!this.isValidJQueryElement($target)) {
                    console.warn(FUNCTION_NAME + "$target is invalid");
                    return;
                }

                if (!this.isValidValue(duration)) {
                    console.warn(FUNCTION_NAME + "duration is invalid");
                    return;
                }

                $target.css("transition-duration", duration + "s");

            }


            /*
             * 対象のJQueryのoffset座標系でのpositionを取得する
             * 
             */
            protected getPosition($target: JQuery): IPosition{
                let FUNCTION_NAME = TAG + "getPosition : ";

                if (!this.isValidJQueryElement($target) || $target.offset() == null) {
                    console.warn(FUNCTION_NAME + "$target is invalid");
                    return;
                }

                let resultPosition: IPosition =
                    {
                        x: $target.offset().left,
                        y: $target.offset().top
                    }

                return resultPosition
            }


            /*
             * 対象のdomの位置を入れ替えるアニメーションをする。
             * @param $target1 {JQuery}
             * @param $target2 {JQuery}
             * @param duration {number} アニメーションの期間 [ms]
             */
            protected exchangeJQueryPositionAnimation($target1: JQuery, $target2: JQuery, duration : number) {
                let FUNCTION_NAME = TAG + "exchangeJQueryPositionAnimation : ";
                

                if (!this.isValidJQueryElement($target1)) {
                    console.warn(FUNCTION_NAME + "$target1 is invalid");
                    return;
                }

                if (!this.isValidJQueryElement($target2)) {
                    console.warn(FUNCTION_NAME + "$target2 is invalid");
                    return;
                }

                let target1Position: IPosition = this.getPosition($target1);
                let target2Position: IPosition = this.getPosition($target2);

                let tmpTarget1Duration = $target1.css("transition-duration");
                let tmpTarget2Duration = $target2.css("transition-duration");

                //durationをセット。
                this.setAnimationDuration($target1, duration / 1000);
                this.setAnimationDuration($target2, duration / 1000);

                
                //移動
                $target1.css("transform", "translateX(" + (target2Position.x - target1Position.x) + "px)");
                $target2.css("transform", "translateX(" + (target1Position.x - target2Position.x) + "px)");
                $target1.css("transform", "translateY(" + (target2Position.y - target1Position.y) + "px)");
                $target2.css("transform", "translateY(" + (target1Position.y - target2Position.y) + "px)");

                setTimeout(()=>{
                    //durationをセット。
                    $target1.css("transition-duration", tmpTarget1Duration);
                    $target2.css("transition-duration", tmpTarget2Duration);
                },duration);
            }



            /*
             * orderの違反をチェックする。
             * order {number} チェックするorder情報
             * @return true:orderとして有効、false:orderとして利用不可。
             */
            protected isValidOrder(order: number):boolean {
                let FUNCTION_NAME = TAG + "isValidOrder : ";

                //値として利用できるかチェック
                if (!this.isValidValue(order)) {
                    console.warn(FUNCTION_NAME + "order is invalid");
                    return false;
                }

                //0未満の値は不正
                if (order < 0) {
                    console.warn(FUNCTION_NAME + "order is negative");
                    return false;
                }

                //最大値より多いと不正
                if (order > MAX_NUM_MACRO_SIGNAL) {
                    console.warn(FUNCTION_NAME + "order is over maxium value");
                    return false;
                }

                return true;

            }


            /*
            * 入力したremoteIdが、キャッシュされたものだった場合、deviceInfoを取得する
            * @param remoteId{string} deviceInfoを取得したいremoteId
            * @return {IButtonDeviceInfo} 見つからなかった場合nullを返す。
            */
            protected getDeviceInfoByRemoteId(remoteId: string): IButtonDeviceInfo{
                let FUNCTION_NAME = TAG + "isCachedMenberRemoteId : ";

                if (!this.isValidValue(remoteId)) {
                    console.warn(FUNCTION_NAME + "remoteId is invalid");
                    return null;
                }


                //modelのアクション中のdeviceInfo
                for (let action of this.model.state[this.DEFAULT_STATE_ID].action) {
                    let deviceInfo: IButtonDeviceInfo= action.deviceInfo;
                    if (deviceInfo != null && deviceInfo.id == remoteId) {
                        return deviceInfo;
                        
                    }

                }

                return null;
            }


            /*
            * ボタンに、入力したデバイスタイプの信号がはいっているかチェックする。
            * @param button{Model.ButtonItem} 判定対象のボタン
            * @param category{string} 特定したいデバイスタイプ
            * @return {boolean} ボタンの信号に入力したデバイスタイプがひとつでもある場合 true, ひとつもない場合false, エラーが発生した場合undefined
            */
            protected isIncludeSpecificDeviceType(button: Model.ButtonItem, category: string): boolean {
                let FUNCTION_NAME = TAG + "isIncludeSpecificDeviceType : ";

                if (!this.isValidValue(button)) {
                    console.warn(FUNCTION_NAME + "button is invalid");
                    return;
                }

                if (!this.isValidValue(category)) {
                    console.warn(FUNCTION_NAME + "category is invalid");
                    return;
                }



                for (let state of button.state) {
                    if (!state.action) continue;

                    for (let action of state.action) {
                        if (!action.deviceInfo || !action.deviceInfo.code_db || !action.deviceInfo.code_db.device_type) continue;

                        if (action.deviceInfo.code_db.device_type == category) {
                            return true;
                        }
                    }
                }

                return false;
            }



            /*
          * ボタンのactionに、特定のアクションが含まれるか判定する
          * @param inputButton{Model.ButtonItem} 判定対象のボタン
          * @param actiionType{string} buttonに含まれているか確かめたいアクションタイプ
          * @return {boolean} 特定のアクションがひとつでも含まれる場合true,ひとつも含まれない場合false.エラーが発生した場合 undefinedを返す。
          */
            protected isIncludeSpecificActionType(button: Model.ButtonItem, actionType
                : string): boolean {
                let FUNCTION_NAME: string = TAG + "isIncludeSpecificActionType : ";

                if (!this.isValidValue(button)) {
                    console.warn(FUNCTION_NAME + "button is invalid");
                    return;
                }

                if (!this.isValidValue(actionType)) {
                    console.warn(FUNCTION_NAME + "actionType is invalid");
                    return;
                }

                for (let state of button.state) {
                    if (!state.action) continue;

                    for (let action of state.action) {
                        if (!action.input) continue;

                        if (action.input == actionType) {
                            return true;
                        }
                    }
                }


                return false;

            }


        }
    }
}