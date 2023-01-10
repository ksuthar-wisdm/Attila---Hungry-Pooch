import React, { Component, Fragment } from 'react';

import DashboardOrders       from '../dashboard-orders';
import DashboardLeaderboards from '../dashboard-leaderboards';

class DashboardMain extends Component {
    render() {
        return <Fragment>
            <DashboardOrders {...this.props} />
            <DashboardLeaderboards {...this.props} />
        </Fragment>
    }
}

export default DashboardMain;

