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

/// <reference path="../../include/interfaces.d.ts" />

module Garage {
    export module Model {

        export namespace ConstValue {
            export const APP_INFO_FILE_NAME: string = "appinfo.ini";
        }

        export class AppInfo extends IniFile implements IAppInfo {
            public system: ISystemInfo;
            public theme: IThemeInfo;

            constructor() {
                super();
                let systemInfo: ISystemInfo = {
                    next_remote_id: ConstValue.DEFAULT_NEW_REMOTE_ID.remote_id
                };
                this.system = systemInfo;

                let theme: IThemeInfo = {
                    path: "",
                    version: 0
                };
                this.theme = theme;
            }

            get next_remote_id(): string {
                return this.system.next_remote_id;
            }

            set next_remote_id(newLastRemoteId: string) {
                this.system.next_remote_id = newLastRemoteId;
            }

            /**
             * @return {string} default AppInfo.ini path
             */
            public getFilePath(): string {
                return Util.PathManager.join(GARAGE_FILES_ROOT, Model.ConstValue.APP_INFO_FILE_NAME);
            }

            /**
             * load ini file and update properties
             */
            public load() {
                let file_path: string = this.getFilePath();
                let appInfo: IAppInfo = super.loadIniFile(file_path);
                if (appInfo == null) {
                    console.warn("app info not found.  default value set");
                    return;
                }
                if (appInfo.system) {
                    this.system = appInfo.system;
                }
                if (appInfo.theme) {
                    this.theme = appInfo.theme;
                }
            }

            public updateLastRemoteId(newRemoteId: RemoteId) {
                this.next_remote_id = newRemoteId.remote_id;
                this.save();
            }

            public updateTheme(theme: IThemeInfo) {
                this.theme = theme;
                this.save();
            }
        }
    }
}
