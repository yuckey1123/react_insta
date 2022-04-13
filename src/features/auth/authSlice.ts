import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

const apiUrl = process.env.REACT_APP_DEV_API_URL;

// API:JWTトークン(アクセストークン)取得
export const fetchAsyncLogin = createAsyncThunk(
    "auth/post",
    async (authen: PROPS_AUTHEN) => {
        const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    }
);

// API:新規アカウント作成
export const fetchAsyncRegister = createAsyncThunk(
    "auth/register",
   async (auth:PROPS_AUTHEN) => {
       const res = await axios.post(`${apiUrl}api/register/`, auth, {
           headers: {
               "Content-Type": "application/json",
           },
       });
       return res.data;
   }
);

// API:プロフィール新規作成
export const fetchAsyncCreateProf = createAsyncThunk(
    "profile/post",
   async (nickName:PROPS_NICKNAME) => {
       const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
           headers: {
               "Content-Type": "application/json",
               Authorization: `JWT ${localStorage.localJWT}`,
           },
       });
       return res.data;
   }
);

// API:プロフィール更新
export const fetchAsyncUpdateProf = createAsyncThunk(
    "profile/put",
   async (profile:PROPS_PROFILE) => {
       const uploadData = new FormData();
       uploadData.append("nickName", profile.nickName);
       profile.img && uploadData.append("img", profile.img, profile.img.name);
       const res = await axios.put(`${apiUrl}api/profile/${profile.id}/`,
       uploadData, {
           headers: {
               "Content-Type": "application/json",
               Authorization: `JWT ${localStorage.localJWT}`,
           }
       });
       return res.data;
   }
);

// API:ログインユーザーのプロフィール取得
export const fetchAsyncGetMyProf = createAsyncThunk(
    "profile/get",
   async () => {
       const res = await axios.get(`${apiUrl}api/myprofile/`, {
           headers: {
               Authorization: `JWT ${localStorage.localJWT}`,
            }
        });
        // 配列で返ってくる
        return res.data[0];
   }
);

// API:登録ユーザーの全プロフィール取得
export const fetchAsyncGetProfs = createAsyncThunk(
    "profiles/get",
   async () => {
       const res = await axios.get(`${apiUrl}api/profile/`, {
           headers: {
               Authorization: `JWT ${localStorage.localJWT}`,
            }
        });
        // 配列で返ってくる
        return res.data;
   }
);

export const authSlice = createSlice({
    name: "auth",
    initialState : {
        openSignIn: true,       // ログイン用モーダル　表示/非表示
        openSignUp: false,      // 新規アカウント作成用モーダル　表示/非表示
        openProfile: false,     // プロフィール編集用モーダル 表示/非表示
        isLoadingAuth: false,   // APIの処理中/待機
        myprofile: {            // ログインユーザーのプロフィール(中身はProfileモデルに合わせてる)
          id: 0,
          nickName: "",
          userProfile: 0,
          created_on: "",
          img: "",
        },
        profiles: [             // プロフィール一覧(中身はProfileモデルに合わせてる)
          {
            id: 0,
            nickName: "",
            userProfile: 0,
            created_on: "",
            img: "",
          },
        ],
    },
    reducers: {
        /**
         * API処理開始
         * @param state 
         */
        fetchCredStart(state) {
            state.isLoadingAuth = true;
        },

         /**
          * API処理終了
          * @param state 
          */
        fetchCredEnd(state) {
            state.isLoadingAuth = false;
        },

        /**
         * ログイン用モーダル表示
         * @param state 
         */
        setOpenSignIn(state) {
            state.openSignIn = true;
        },

        /**
         * ログイン用モーダル非表示
         * @param state 
         */
        resetOpenSignIn(state) {
            state.openSignIn = false;
        },

        /**
         * 新規アカウント作成用モーダル表示
         * @param state 
         */
        setOpenSignUp(state) {
            state.openSignUp = true;
        },

        /**
         * 新規アカウント作成用モーダル非表示
         * @param state 
         */
        resetOpenSignUp(state) {
            state.openSignUp = false;
        },

        /**
         * プロフィール編集用モーダル表示
         * @param state 
         */
        setOpenProfile(state) {
            state.openProfile = true;
        },

        /**
         * プロフィール編集用モーダル非表示
         * @param state 
         */
        resetOpenProfile(state) {
            state.openProfile = false;
        },

        /**
         * ニックネームの編集(上書き)
         * @param state 
         * @param action ニックネーム編集用のaction
         */
        editNickname(state, action) {
            // payloadからユーザーが入力した文字列を受け取る
            state.myprofile.nickName = action.payload;
        },
    },
    extraReducers: (builder) => {
        // 各API処理が成功した場合の後処理
        builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
            localStorage.setItem("localJWT", action.payload.access);
        });
        builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
            state.myprofile = action.payload;
        });
        builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
            state.myprofile = action.payload;
        });
        builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
            state.profiles = action.payload;
        });
        builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
            state.myprofile = action.payload;
            state.profiles = state.profiles.map((prof) =>
                prof.id === action.payload.id ? action.payload : prof
            );
        });
    },
});

export const {
    fetchCredStart,
    fetchCredEnd,
    setOpenSignIn,
    resetOpenSignIn,
    setOpenSignUp,
    resetOpenSignUp,
    setOpenProfile,
    resetOpenProfile,
    editNickname,
  } = authSlice.actions;

export const selectIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;