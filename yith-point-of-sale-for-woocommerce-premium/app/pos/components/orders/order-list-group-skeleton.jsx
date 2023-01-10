import Skeleton from '../../packages/components/skeleton';

export default function OrderListGroupSkeleton() {
	return <div className="order-group order-group--skeleton">
		<div className="order-group-data">
			<Skeleton className="arrow" variant="title" background="light"/>
			<Skeleton className="date" variant="title" background="light"/>
			<div className="stat">
				<Skeleton className="orders" variant="title" background="light"/>
			</div>
		</div>
	</div>
}