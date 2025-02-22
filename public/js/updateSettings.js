/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (obj, type) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/${type === 'password' ? 'updatePassword' : 'updateCurrentUser'}`,
            data: obj
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Detail Updated Successfully!`);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};
