#include <sys/ioctl.h>
#include <net/if.h>
#include <arpa/inet.h>
#include <stdio.h>

int main( ){
	char	buf[1024];
	struct	ifconf	ifc;
	struct	ifreq 	*ifr;
	int	sck, n_interfaces, i;

	sck	= socket( AF_INET, SOCK_DGRAM, 0 );
	if( sck < 0 ){
		perror( "Couldn't open a socket." );
		return 1;
	};

	ifc.ifc_len	= sizeof( buf );
	ifc.ifc_buf	= buf;
	if( ioctl( sck, SIOCGIFCONF, &ifc ) < 0 ){
		perror( "Coulndn't get list of interfaces.." );
		return 1;
	}

	ifr		= ifc.ifc_req;
	n_interfaces	= ifc.ifc_len / sizeof( struct ifreq );
	for( i=0; i<n_interfaces; i++ ){
		struct ifreq *item = &ifr[i];

		printf( "%s:%s",
			item->ifr_name,								/* Interface name */
			inet_ntoa( ( (struct sockaddr_in *)&item->ifr_addr)->sin_addr ) 	/* ipv4 address. */
		);

		if( ioctl( sck, SIOCGIFBRDADDR, item ) >= 0 ){
			printf( ":%s",
				inet_ntoa( ( (struct sockaddr_in *)&item->ifr_broadaddr)->sin_addr )	/* Broadcast ipv4 address. */
			);
		} 

		if( ioctl( sck, SIOCGIFFLAGS, item ) >= 0 ){
			if( (ifr->ifr_flags)&IFF_UP ){						/* Interface state.. */
				printf( ":UP" );
			}else{
				printf( ":DOWN" );
			}
		}

		if( ioctl( sck, SIOCGIFHWADDR, item ) >= 0 ){
			char	mac[12];
			sprintf( mac, "%.2x:%.2x:%.2x:%.2x:%.2x:%.2x",
					(unsigned char)item->ifr_hwaddr.sa_data[0],
					(unsigned char)item->ifr_hwaddr.sa_data[1],
					(unsigned char)item->ifr_hwaddr.sa_data[2],
					(unsigned char)item->ifr_hwaddr.sa_data[3],
					(unsigned char)item->ifr_hwaddr.sa_data[4],
					(unsigned char)item->ifr_hwaddr.sa_data[5]
				);

			printf( ":%s", mac );
		}

		printf( "\n" );
	};

	return 0;
}
