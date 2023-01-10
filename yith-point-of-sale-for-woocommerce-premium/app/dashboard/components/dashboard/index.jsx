import React                                                      from 'react';
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

import { getHistory } from '@woocommerce/navigation';

import Controller    from '../controller';
import DashboardMain from '../dashboard-main';

export default function Dashboard() {
	const history = getHistory();

	return <div className="yith-pos-dashboard">
		<HistoryRouter history={history}>
			<Routes>
				<Route path="/*" element={<Controller container={DashboardMain}/>}/>
			</Routes>
		</HistoryRouter>
	</div>
}

