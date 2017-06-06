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

module Garage {
    export module Util {

        import Dialog = CDP.UI.Dialog;

        var TAG: string = "[Garage.Util.InformationDialog]";

        var LAST_NOTIFIED_VERSION_TEXT_PATH: string = path.join(GARAGE_FILES_ROOT, "last_notified_version.txt").replace(/\\/g, "/");
        var FILE_NAME_DATE = "date.txt";
        var FILE_NAME_IMAGE = "image.png";
        var FILE_NAME_NOTE = "note.txt";



        /**
         * @class Notifier
		 * @brief ui-creatorアップデート後の初回起動時かどうかの判定を行い、お知らせダイアログを表示するクラス
		 */
        export class InformationDialog {

            /**
             * ui-creatorアップデート後の初回起動時かどうかの判定を行う関数
             */
            public shouldNotify() {
                let FUNCTION_NAME: string = TAG + " : shouldNotify : ";

                try {
                    let preVersion: string = APP_VERSION;
                    let lastNotifiedVersion: string;
                    if (fs.existsSync(LAST_NOTIFIED_VERSION_TEXT_PATH)) {
                        lastNotifiedVersion = fs.readFileSync(LAST_NOTIFIED_VERSION_TEXT_PATH).toString();
                    } else {
                        console.log(FUNCTION_NAME + LAST_NOTIFIED_VERSION_TEXT_PATH + " is not exist.");
                    }
                    if (preVersion === lastNotifiedVersion) return false;
                    else return true;
                } catch (err) {
                    console.error(FUNCTION_NAME + err);
                }
            }

            /**
             * notesディレクトリを参照し、お知らせダイアログを表示する関数
             *
             * お知らせを追加する場合は/app/res/notes/のディレクトリにフォルダを追加し、
             * 追加したディレクトリ内に date.txt, image.png, note.txt の３つのファイルを追加してください。
             * テキストファイルはutf-8で保存してください。shift-JISだと文字化けします。
		     */
            public notify() {
                let FUNCTION_NAME: string = TAG + " : Notify : ";

                try {

                    var dialog: Dialog = null;
                    var props: DialogProps = null;
                    var informationList: { dirName: string, date: string, imagePath: string, text: string }[] = [];


                    //お知らせダイアログにだすコンテンツがあるフォルダを指定
                    var pathToNotes: string = Util.MiscUtil.getAppropriatePath(CDP.Framework.toUrl("/res/notes/"));
                    // Garage のファイルのルートパス設定 (%APPDATA%\Garage)
                    if (Util.MiscUtil.isWindows()) {
                        pathToNotes = path.join(pathToNotes, DIR_NAME_WINDOWS + "/").replace(/\\/g, "/");
                    } else if (Util.MiscUtil.isDarwin()) {
                        pathToNotes = path.join(pathToNotes, DIR_NAME_MAC + "/");
                    } else {
                        console.error("Error: unsupported platform");
                    }

                    var contentsDirs: string[] = fs.readdirSync(pathToNotes); // noteの情報が入っているディレクトリのパス群

                    //もしコンテンツがない場合、なにも表示しない
                    if (!this.isExistValidContents(contentsDirs)) {
                        return;
                    }

                    contentsDirs.reverse(); // 新しいnoteから表示させるために反転させる

                    // ダイアログにnoteを追加させていく
                    contentsDirs.forEach(function (dirName) {
                        let path = pathToNotes + dirName + "/";
                        informationList.push({
                            dirName: dirName, // 現状は利用していないプロパティ（特に表示したいお知らせがある場合はdirNameを利用してjQueryで操作）
                            imagePath: (path + FILE_NAME_IMAGE),
                            date: fs.readFileSync(path + FILE_NAME_DATE, "utf8"),
                            text: fs.readFileSync(path + FILE_NAME_NOTE, "utf8")
                        });
                    });

                    dialog = new CDP.UI.Dialog("#common-dialog-information", {
                        src: CDP.Framework.toUrl("/templates/dialogs.html"),
                        title: $.i18n.t("information.STR_INFORMATION_TITLE"),
                        informationList: informationList,
                        dismissible: true,
                    });

                    dialog.show();

                    //お知らせダイアログを出すか否か判定するファイルを書き出す。
                    fs.outputFile(LAST_NOTIFIED_VERSION_TEXT_PATH, APP_VERSION, function (err) { console.log(err); });

                } catch (err) {
                    console.error(FUNCTION_NAME + "information dialog の表示に失敗しました。" + err);
                }
            }



            /*
            * お知らせダイアログに表示するコンテンツが存在するか判定する。
            * @param {string[]} お知らせダイアログのコンテンツが存在するフォルダに存在するファイル/フォルダ名の配列
            * @return {boolean} 000, 001, のように XXX(Xは整数) のフォルダが場合true, ひとつも存在しない場合false
            */
            private isExistValidContents(contentsDirs: string[]): boolean {
                let FUNCTION_NAME: string = TAG + " : isExistValidContents : ";

                //対象のパスにひとつもファイルもフォルダもない場合false;
                if (contentsDirs.length == 0) {
                    return false;
                }

                //一つでも、有効なコンテンツ名がある場合、true
                for (let dirName of contentsDirs) {
                    if (dirName.match(/^[0-9]{3}$/)) {
                        return true;
                    }
                }

                //ひとつも、有効なコンテンツ名がない場合、false;
                return false;
            }


        }
    }
}
